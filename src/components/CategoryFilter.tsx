
import React from 'react';
import { categories } from '@/lib/categories';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant="outline"
        className={cn(
          "border-purple-500",
          selectedCategory === null && "bg-purple-500 text-white hover:bg-purple-600"
        )}
        onClick={() => onSelectCategory(null)}
      >
        All
      </Button>
      {categories.map((category) => (
        <Button
          key={category.value}
          variant="outline"
          className={cn(
            "border-purple-500",
            selectedCategory === category.value && "bg-purple-500 text-white hover:bg-purple-600"
          )}
          onClick={() => onSelectCategory(category.value)}
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
}
