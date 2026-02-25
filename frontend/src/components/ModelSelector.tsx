import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Brain, TrendingUp, Activity } from 'lucide-react';

export type MLModel = 'regression' | 'ann' | 'lstm';

interface ModelSelectorProps {
  value: MLModel;
  onChange: (model: MLModel) => void;
}

const models: { value: MLModel; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'regression', label: 'Linear Regression', icon: TrendingUp },
  { value: 'ann', label: 'ANN', icon: Brain },
  { value: 'lstm', label: 'LSTM-like', icon: Activity },
];

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Prediction Model</p>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => v && onChange(v as MLModel)}
        className="gap-1"
      >
        {models.map((model) => {
          const Icon = model.icon;
          return (
            <ToggleGroupItem
              key={model.value}
              value={model.value}
              className="text-xs px-3 py-1.5 h-auto data-[state=on]:bg-energy/20 data-[state=on]:text-energy data-[state=on]:border-energy/40 border border-transparent"
            >
              <Icon className="w-3 h-3 mr-1.5" />
              {model.label}
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </div>
  );
}
