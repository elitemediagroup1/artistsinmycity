# Component: Roadie Widget

## Purpose
Reusable Roadie floating widget for all public pages and dashboards.

## Required Props
mode: fan | artist | creator | admin | public
initialOpen?: boolean
quickActions?: string[]

## Asset Use
Read /public/assets/characters/roadie/roadie.json if present. Fallback to documented asset paths.

## States
collapsed, open, loading, thinking, success, error.

## Acceptance
Bottom right, accessible, keyboard operable, does not block critical CTAs on mobile.
