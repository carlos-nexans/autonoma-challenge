// components/ui/responsive-select.tsx
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export interface SelectOption {
  value: string;
  label: string;
}

interface ResponsiveSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  triggerClassName?: string;
}

export function ResponsiveSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Select option',
  disabled = false,
  triggerClassName,
}: ResponsiveSelectProps) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const selectedOption = options.find((option) => option.value === value);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className={cn('w-full justify-between', triggerClassName)}
            disabled={disabled}
          >
            {selectedOption?.label || placeholder}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{placeholder}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <div className="space-y-2">
              {options.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className={cn("w-full justify-between", value === option.value && "bg-accent text-accent-foreground")}
                  onClick={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                  {value === option.value && <Check className="h-4 w-4" />}
                </Button>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span>{option.label}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
