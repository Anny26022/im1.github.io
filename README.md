# Stock Industry Mapper

A modern web application that allows users to map stock symbols to industries, providing detailed fundamental data and visualizations.

## Features

- **Symbol Mapping**: Quickly map multiple stock symbols to their respective industries
- **Industry Browsing**: Explore 136 unique industries and view all stocks within each industry
- **Watchlist Management**: Create and maintain a personal watchlist of favorite symbols
- **Drag and Drop Reordering**: Reorder watchlist items using intuitive drag and drop
- **Recent Industries**: Track recently viewed industries for quick access
- **Theme Persistence**: Choose between light, dark, or system theme with automatic persistence
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API
- **Animation**: Framer Motion for smooth transitions
- **Drag and Drop**: dnd-kit library for accessible drag and drop functionality
- **Data Processing**: CSV parsing with Papa Parse
- **Storage**: Local storage for persistence across sessions

## Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/stock-industry-mapper.git
   cd stock-industry-mapper
   ```

2. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```

3. Run the development server:
   ```bash
   bun run dev
   # or
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Mapping Symbols**: Enter stock symbols in the input area, separated by commas or new lines.
2. **Viewing Industries**: Click on any industry in the "Available Industries" panel to see all stocks in that industry.
3. **Using Watchlist**: Add symbols to your watchlist from search results or industry dialogs.
4. **Reordering Watchlist**: Toggle the reorder mode and drag items to rearrange them.
5. **Changing Theme**: Click the theme toggle in the header to switch between light, dark, and system themes.

## Data Structure

The application uses three main CSV data files:
- `Industry_Analytics.csv`: Contains the mapping between symbols and industries
- `Basic_RS_Setup.csv`: Contains fundamental data for stocks
- `Results_Calendar.csv`: Contains upcoming earnings dates

## License

MIT
