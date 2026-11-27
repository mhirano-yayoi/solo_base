import { IonSearchbar } from '@ionic/react';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChange,
  placeholder = '検索',
}: SearchBarProps) {
  return (
    <IonSearchbar
      value={value}
      placeholder={placeholder}
      onIonInput={(event) => onChange(event.detail.value ?? '')}
      debounce={100}
    />
  );
}
