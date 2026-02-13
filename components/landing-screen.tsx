"use client"

import { Heart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LandingScreenProps {
  onCreateNew: () => void
}

export function LandingScreen({ onCreateNew }: LandingScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="animate-fade-in-up">
        <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-soft" />
          <Heart className="relative h-14 w-14 text-primary" fill="currentColor" />
        </div>

        <h1 className="mb-4 font-serif text-5xl font-bold tracking-tight text-foreground md:text-6xl">
          <span className="text-balance">{"Be My Valentine?"}</span>
        </h1>

        <p className="mx-auto mb-2 max-w-md text-lg leading-relaxed text-muted-foreground">
          Create a heartfelt digital scavenger hunt for your special someone.
        </p>
        <p className="mx-auto mb-10 max-w-sm text-sm leading-relaxed text-muted-foreground/70">
          Add your favorite photos, craft questions only they would know,
          and surprise them with the sweetest question of all.
        </p>

        <Button
          onClick={onCreateNew}
          size="lg"
          className="group rounded-full bg-primary px-8 py-6 text-lg font-medium text-primary-foreground shadow-lg transition-all hover:shadow-xl"
        >
          Create Your Valentine
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  )
}
