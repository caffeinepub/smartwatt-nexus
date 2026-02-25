import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type UserId = Principal;
  type Units = Nat;
  type Rupees = Nat;
  type Timestamp = Nat;

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
    consumerNumber : Text;
  };

  public type ConsumptionRecord = {
    user : UserId;
    date : Timestamp;
    unitsConsumed : Units;
    timestamp : Timestamp;
  };

  module Tariff {
    public let freeBPLLimit = 50;
    public let slab1Rate = 145; // ₹1.45/unit in paise
    public let slab2Rate = 260; // ₹2.60/unit in paise
    public let slab3Rate = 350; // ₹3.50/unit in paise
    public let slab4Rate = 500; // ₹5.00/unit in paise
    public let aboveSlab4Rate = 850; // ₹8.50/unit in paise
    public let fixedCharges = 5000; // ₹50 fixed charges in paise

    public func calculateBill(amount : Units, bplEligible : Bool) : Rupees {
      var slabsRemaining = amount;
      var billAmount = 0;

      if (bplEligible and slabsRemaining <= freeBPLLimit) { return 0 };

      // 0–50 units
      if (slabsRemaining > 0) {
        let slabUnits = if (slabsRemaining > 50) { 50 } else { slabsRemaining };
        billAmount += slabUnits * slab1Rate;
        slabsRemaining -= slabUnits;
      };

      // 51–100 units
      if (slabsRemaining > 0) {
        let slabUnits = if (slabsRemaining > 50) { 50 } else { slabsRemaining };
        billAmount += slabUnits * slab2Rate;
        slabsRemaining -= slabUnits;
      };

      // 101–200 units
      if (slabsRemaining > 0) {
        let slabUnits = if (slabsRemaining > 100) { 100 } else { slabsRemaining };
        billAmount += slabUnits * slab3Rate;
        slabsRemaining -= slabUnits;
      };

      // 201–300 units
      if (slabsRemaining > 0) {
        let slabUnits = if (slabsRemaining > 100) { 100 } else { slabsRemaining };
        billAmount += slabUnits * slab4Rate;
        slabsRemaining -= slabUnits;
      };

      // Above 300 units
      if (slabsRemaining > 0) {
        billAmount += slabsRemaining * aboveSlab4Rate;
      };

      // Return total bill amount in rupees (convert paise to rupees)
      (billAmount + fixedCharges) / 100;
    };
  };

  let userProfiles = Map.empty<UserId, UserProfile>();
  let consumptionRecords = Map.empty<UserId, List.List<ConsumptionRecord>>();

  public type BillEstimate = {
    unitsConsumed : Units;
    totalCost : Rupees;
    unitCost : Nat;
  };

  public type Slab = {
    name : Text;
    unitLimit : ?Nat;
    perUnitCost : Nat; // In paise
  };

  public type SlabBreakdown = {
    name : Text;
    units : Units;
    cost : Rupees;
    perUnitCost : Nat; // In paise
  };

  public type BillDetails = {
    totalUnitsConsumed : Units;
    totalCost : Rupees;
    fixedCharges : Rupees;
    slabCosts : [SlabBreakdown];
  };

  func getSlabCost(units : Units, slab : Slab) : Rupees {
    (units * slab.perUnitCost) / 100; // Convert paise to rupees
  };

  // ── Profile helpers required by the frontend ──────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save their profile");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // ── Bill estimation (no auth required – public utility) ───────────────────

  public query func calculateBillEstimate(units : Units, isBPL : Bool) : async BillEstimate {
    let totalCost = Tariff.calculateBill(units, isBPL);
    let unitCost = if (units > 0) { totalCost * 100 / units } else { 0 };
    {
      unitsConsumed = units;
      totalCost;
      unitCost;
    };
  };

  public query func getDetailedBillEstimate(units : Units, isBPL : Bool) : async BillDetails {
    let totalCost = Tariff.calculateBill(units, isBPL);

    func calculateSlabBreakdown(slab : Slab, unitsInSlab : Units) : SlabBreakdown {
      {
        name = slab.name;
        units = unitsInSlab;
        cost = getSlabCost(unitsInSlab, slab);
        perUnitCost = slab.perUnitCost;
      };
    };

    let slabs : [Slab] = [
      { name = "0\u{2013}50 units"; unitLimit = ?50; perUnitCost = Tariff.slab1Rate },
      { name = "51\u{2013}100 units"; unitLimit = ?50; perUnitCost = Tariff.slab2Rate },
      { name = "101\u{2013}200 units"; unitLimit = ?100; perUnitCost = Tariff.slab3Rate },
      { name = "201\u{2013}300 units"; unitLimit = ?100; perUnitCost = Tariff.slab4Rate },
      { name = "Above 300 units"; unitLimit = null; perUnitCost = Tariff.aboveSlab4Rate },
    ];

    var slabsRemaining = units;
    let slabCosts = List.empty<SlabBreakdown>();

    for (slab in slabs.values()) {
      if (slabsRemaining > 0) {
        var unitsInSlab = 0;
        switch (slab.unitLimit) {
          case (null) { unitsInSlab := slabsRemaining };
          case (?limit) {
            if (slabsRemaining > limit) {
              unitsInSlab := limit;
            } else {
              unitsInSlab := slabsRemaining;
            };
          };
        };
        slabCosts.add(calculateSlabBreakdown(slab, unitsInSlab));
        slabsRemaining -= unitsInSlab;
      };
    };

    {
      totalUnitsConsumed = units;
      totalCost;
      fixedCharges = 50;
      slabCosts = slabCosts.toArray();
    };
  };

  // ── User registration (open to any authenticated principal) ───────────────

  public shared ({ caller }) func registerUser(profile : UserProfile) : async () {
    // Any authenticated (non-anonymous) caller may register.
    // After registration the frontend should assign the #user role via
    // the MixinAuthorization helpers; here we simply store the profile.
    switch (userProfiles.get(caller)) {
      case (null) {
        userProfiles.add(caller, profile);
      };
      case (?_existing) { Runtime.trap("User is already registered") };
    };
  };

  // ── Consumption records ───────────────────────────────────────────────────

  public shared ({ caller }) func addConsumptionRecord(date : Timestamp, unitsConsumed : Units) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add consumption records");
    };

    let record : ConsumptionRecord = {
      user = caller;
      date;
      unitsConsumed;
      timestamp = date;
    };

    let existingRecords = switch (consumptionRecords.get(caller)) {
      case (null) { List.empty<ConsumptionRecord>() };
      case (?records) { records };
    };
    existingRecords.add(record);
    consumptionRecords.add(caller, existingRecords);
  };

  public query ({ caller }) func getUserConsumptionRecords() : async [ConsumptionRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their consumption records");
    };

    switch (consumptionRecords.get(caller)) {
      case (null) { [] };
      case (?records) { records.toArray() };
    };
  };

  public query ({ caller }) func getUserConsumptionSummary() : async { totalUnits : Units; records : [ConsumptionRecord] } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their consumption summary");
    };

    let records = switch (consumptionRecords.get(caller)) {
      case (null) { List.empty<ConsumptionRecord>() };
      case (?r) { r };
    };

    var total = 0;
    for (record in records.values()) {
      total += record.unitsConsumed;
    };

    {
      totalUnits = total;
      records = records.toArray();
    };
  };

  public shared ({ caller }) func seedTestConsumptionData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can seed test data");
    };

    let records = List.empty<ConsumptionRecord>();
    var i = 0;
    while (i < 30) {
      let record : ConsumptionRecord = {
        user = caller;
        date = 1_700_000_000 + i * 86_400;
        unitsConsumed = 5;
        timestamp = 1_700_000_000 + i * 86_400;
      };
      records.add(record);
      i += 1;
    };
    consumptionRecords.add(caller, records);
  };

  // ── Admin-only functions ──────────────────────────────────────────────────

  public query ({ caller }) func getConsumptionRecordsByUser(user : UserId) : async [ConsumptionRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view other users' consumption records");
    };

    switch (consumptionRecords.get(user)) {
      case (null) { [] };
      case (?records) { records.toArray() };
    };
  };

  public query ({ caller }) func getTotalUnitsConsumed(user : UserId) : async Units {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view total units for arbitrary users");
    };

    var total = 0;
    switch (consumptionRecords.get(user)) {
      case (null) { return 0 };
      case (?records) {
        for (record in records.values()) {
          total += record.unitsConsumed;
        };
      };
    };
    total;
  };

  public shared ({ caller }) func assignRole(user : Principal, role : AccessControl.UserRole) : async () {
    // assignRole already contains an admin-only guard inside the module.
    AccessControl.assignRole(accessControlState, caller, user, role);
  };
};
