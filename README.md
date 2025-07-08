# 💰 Personal Finance Tracker

A modern, full-stack personal finance management application built with Next.js 15, React 18, TypeScript, MongoDB, and Tailwind CSS.

## ✨ Features

### 📊 **Dashboard Overview**
- Real-time financial summary with income, expenses, and net savings
- Interactive charts and visualizations
- Monthly spending trends and category breakdowns
- Recent transactions with quick actions

### 💳 **Transaction Management**
- Add, edit, and delete transactions
- Categorize transactions (Food & Dining, Transportation, Entertainment, etc.)
- Filter transactions by month and type
- Beautiful, responsive transaction list with modern UI

### 🎯 **Budget Tracking**
- Set monthly and category-specific budgets
- Visual progress indicators
- Budget vs. actual spending comparisons
- Smart alerts for budget overruns

### 📈 **Financial Insights**
- Detailed spending analytics
- Category-wise spending breakdowns
- Monthly comparison charts
- Top spending categories analysis
- Smart recommendations and insights

### 🎨 **Modern UI/UX**
- Responsive design for all devices
- Smooth animations and transitions
- Toast notifications for user feedback
- Loading skeletons for better UX

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Charts**: Recharts for data visualization
- **Database**: MongoDB with Mongoose ODM
- **State Management**: SWR for data fetching and caching
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/personal-finance-tracker.git
   cd personal-finance-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
personal-finance-tracker/
├── app/                    # Next.js 15 app directory
│   ├── api/               # API routes
│   ├── budgets/           # Budget pages
│   ├── insights/          # Analytics pages
│   ├── transactions/      # Transaction pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── insights/         # Chart components
│   └── layout/           # Layout components
├── lib/                  # Utility functions
├── models/               # MongoDB models
└── public/               # Static assets
```

## 🔧 Configuration

### MongoDB Setup
1. Create a MongoDB database (local or cloud)
2. Update the `MONGODB_URI` in your `.env.local` file
3. The app will automatically create collections and indexes

### Customization
- Modify transaction categories in `lib/types.ts`
- Update color schemes in `tailwind.config.js`
- Customize charts in the insights components

## 📱 Features in Detail

### Transaction Management
- **Add Transactions**: Quick form with category selection
- **Edit Transactions**: Inline editing with validation
- **Delete Transactions**: Confirmation dialogs
- **Filter & Search**: By date, category, and amount

### Budget System
- **Monthly Budgets**: Overall spending limits
- **Category Budgets**: Specific category spending limits
- **Progress Tracking**: Visual indicators and alerts
- **Flexible Periods**: Monthly, quarterly, or custom periods

### Analytics & Insights
- **Spending Trends**: Line charts showing spending over time
- **Category Breakdown**: Pie charts for spending distribution
- **Monthly Comparisons**: Bar charts for income vs expenses
- **Smart Insights**: AI-powered spending recommendations

## 🎯 Performance Optimizations

- **Database Connection Pooling**: Optimized MongoDB connections
- **SWR Caching**: Intelligent data caching and revalidation
- **Code Splitting**: Dynamic imports for charts and heavy components
- **Loading States**: Skeleton loaders for better perceived performance
- **Font Preloading**: Optimized font loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Recharts](https://recharts.org/) for data visualization
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Next.js](https://nextjs.org/) for the amazing framework

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the maintainers.

---

**Built with ❤️ using Next.js 15 and modern web technologies** 
