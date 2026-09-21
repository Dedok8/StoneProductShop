import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useQueryState } from "@/shared/hooks";
import { Button } from "@/shared/ui/components/button";
import { Card, CardContent } from "@/shared/ui/components/card";
import { Input } from "@/shared/ui/components/input";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface ISearchProps<T> {
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: T) => void;

  items: T[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error?: FetchBaseQueryError | SerializedError;
  hasQuery: boolean;

  getKey: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;

  placeholder?: string;
  emptyText?: string;
}

function Search<T>({
  value,
  onChange,
  onSelect,
  items,
  isLoading,
  isError,
  isFetching,
  error,
  hasQuery,
  getKey,
  renderItem,
  placeholder,
  emptyText,
}: ISearchProps<T>) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const queryState = useQueryState(isLoading, isError, error);

  const showDropdown = isOpen && hasQuery;

  const handleSearch = (item: T) => {
    onSelect(item);
    setIsOpen(false);
  };

  return (
    <Card>
      <Input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder={placeholder}
      />

      {showDropdown && (
        <CardContent>
          {queryState}

          {!isLoading && !isFetching && !isError && items.length === 0 && (
            <p className="px-3 py-2 text-sm text-stone-400">
              {emptyText ?? t("common.isEmpty")}
            </p>
          )}

          {items.length > 0 && (
            <ul className="max-h-72 divide-y divide-stone-100 overflow-y-auto">
              {items.map((item) => (
                <li key={getKey(item)}>
                  <Button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSearch(item)}
                  >
                    {renderItem(item)}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default Search;
