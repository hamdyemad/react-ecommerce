# eCommerce Design System - Project Overview

## Overview
This is a modern, high-performance React e-commerce application built with a robust Design System. It features full **Multi-language (i18n)** support, **Dark/Light mode**, and **RTL (Right-to-Left)** layout capabilities. The architecture follows a modular approach using **Atomic Design** principles.

## Tech Stack
- **Framework:** React 18+ (Vite)
- **Build Tool:** Vite
- **Routing:** React Router DOM v6+
- **Styling:** CSS3 + Tailwind CSS v4 + PostCSS
- **Internationalization:** `react-i18next` (i18next)
- **State Management:** React Context API (`useTheme`, `useDirection`, `useCatalog`, `useSettings`)
- **API Client:** Axios (Custom client in `src/api/client.ts`)
- **Fonts:** Inter (English) & Cairo (Arabic) via Google Fonts

## Project Structure
- `/src/api`: Axios instance and interceptors (handles auth tokens, lang headers).
- `/src/assets`: Images, logos, and global assets.
- `/src/components`: 
  - `/atoms`: Basic building blocks (Badge, Button, Input).
  - `/molecules`: Combinations of atoms (Carousel, BreadCrumb, SearchBar).
  - `/organisms`: Complex UI sections (Header, Sidebar, Footer, CartDrawer, ProductGrid).
- `/src/data`: Static mock data (products, deals).
- `/src/hooks`: Global state hooks (`useTheme`, `useDirection`, `useCatalog`, `useSettings`, `useScrollAnimation`).
- `/src/locales`: JSON translation files (`en`, `ar`) for all application text.
- `/src/pages`: Feature pages (Home, Profile, Categories, ProductDetails, Auth, etc.).
- `/src/services`: API service layers (auth, area, category, department, settings).
- `/src/tokens`: Design system tokens (colors, gradients, shadows, typography, motion).
- `/src/types`: TypeScript interfaces for API responses and internal models.

## Routing
Inside `src/App.tsx`, we define the following key routes:
- `/` - Home Page (Hero, Categories, Hot Deals, All Products, Features).
- `/login`, `/register`, `/forgot-password`, `/reset-password` - Authentication.
- `/profile/*` - User dashboard (Orders, Reviews, Addresses, Settings).
- `/departments`, `/department/:id` - Higher-level category organization.
- `/categories`, `/category/:id` - Detailed category views.
- `/cart`, `/wishlist` - User-specific collection pages.
- `/about-us`, `/contact`, `/faqs`, `/terms`, `/privacy-policy` - Information pages.

## Global Contexts
1. **`ThemeProvider`**: Manages `mode` ('light' | 'dark'). Applies `.dark` class to `<html>`.
2. **`DirectionProvider`**: Manages `language` ('en' | 'ar') and `direction` ('ltr' | 'rtl'). Handles country selection.
3. **`SettingsProvider`**: Fetches and provides site-wide configuration (social links, contact info).
4. **`CatalogProvider`**: Fetches categories and countries for use across the app.
