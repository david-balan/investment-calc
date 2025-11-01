
'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, PiggyBank, Save, History, LogOut, LogIn } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('stocks');
  const [savedCalculations, setSavedCalculations] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [saving, setSaving] = useState(false);

  // Stock Investment State
  const [stockInitial, setStockInitial] = useState(10000);
  const [stockMonthly, setStockMonthly] = useState(500);
  const [stockReturn, setStockReturn] = useState(8);
  const [stockYears, setStockYears] = useState(20);

  // Retirement State
  const [retireInitial, setRetireInitial] = useState(50000);
  const [retireMonthly, setRetireMonthly] = useState(1000);
  const [retireReturn, setRetireReturn] = useState(7);
  const [retireYears, setRetireYears] = useState(30);
  const [currentAge, setCurrentAge] = useState(35);

  useEffect(() => {
    if (session) {
      fetchCalculations();
    }
  }, [session]);

  const fetchCalculations = async () => {
    try {
      const response = await fetch('/api/calculations');
      if (response.ok) {
        const data = await response.json();
        setSavedCalculations(data);
      }
    } catch (error) {
      console.error('Error fetching calculations:', error);
    }
  };

  const saveCalculation = async () => {
    if (!session) {
      alert('Please sign in to save calculations!');
      return;
    }

    setSaving(true);
    const calculation = {
      type: activeTab,
      parameters: activeTab === 'stocks'
        ? { stockInitial, stockMonthly, stockReturn, stockYears }
        : { retireInitial, retireMonthly, retireReturn, retireYears, currentAge },
      results: {
        finalBalance: finalData.balance,
        totalContributions: finalData.contributions,
        totalEarnings: finalData.earnings
      }
    };

    try {
      const response = await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calculation)
      });

      if (response.ok) {
        await fetchCalculations();
        alert('✅ Calculation saved to your account!');
      } else {
        alert('❌ Failed to save calculation');
      }
    } catch (error) {
      console.error('Error saving calculation:', error);
      alert('❌ Error: Could not connect to database');
    } finally {
      setSaving(false);
    }
  };

  const loadCalculation = (calc: any) => {
    if (calc.type === 'stocks') {
      setActiveTab('stocks');
      setStockInitial(calc.parameters.stockInitial);
      setStockMonthly(calc.parameters.stockMonthly);
      setStockReturn(calc.parameters.stockReturn);
      setStockYears(calc.parameters.stockYears);
    } else {
      setActiveTab('retirement');
      setRetireInitial(calc.parameters.retireInitial);
      setRetireMonthly(calc.parameters.retireMonthly);
      setRetireReturn(calc.parameters.retireReturn);
      setRetireYears(calc.parameters.retireYears);
      setCurrentAge(calc.parameters.currentAge);
    }
    setShowHistory(false);
  };

  const calculateInvestment = (initial: number, monthly: number, annualReturn: number, years: number) => {
    const monthlyRate = annualReturn / 100 / 12;
    const months = years * 12;
    const data = [];

    let balance = initial;
    let totalContributions = initial;

    data.push({
      year: 0,
      balance: Math.round(balance),
      contributions: Math.round(totalContributions),
      earnings: 0
    });

    for (let month = 1; month <= months; month++) {
      balance = balance * (1 + monthlyRate) + monthly;
      totalContributions += monthly;

      if (month % 12 === 0) {
        const year = month / 12;
        data.push({
          year,
          balance: Math.round(balance),
          contributions: Math.round(totalContributions),
          earnings: Math.round(balance - totalContributions)
        });
      }
    }

    return data;
  };

  const stockData = calculateInvestment(stockInitial, stockMonthly, stockReturn, stockYears);
  const retireData = calculateInvestment(retireInitial, retireMonthly, retireReturn, retireYears);

  const activeData = activeTab === 'stocks' ? stockData : retireData;
  const finalData = activeData[activeData.length - 1];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  // Not signed in
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md text-center">
          <div className="mb-8">
            <DollarSign className="mx-auto text-blue-600 mb-4" size={80} />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Investment Calculator
            </h1>
            <p className="text-lg text-gray-600">
              Plan your financial future with compound interest projections
            </p>
          </div>
          
          <button
            onClick={() => signIn('google')}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-xl"
          >
            <LogIn size={24} />
            Sign in with Google
          </button>

          <p className="text-sm text-gray-500 mt-6">
            Sign in to save your calculations and access them anywhere
          </p>
        </div>
      </div>
    );
  }

  // Signed in - show calculator
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with User Info */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
              Investment & Retirement Calculator
            </h1>
            <p className="text-blue-200 text-lg">Plan your financial future with compound interest projections</p>
          </div>
          
          {/* User Profile */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4">
            {session.user?.image && (
              <img 
                src={session.user.image} 
                alt="Profile" 
                className="w-12 h-12 rounded-full border-2 border-white"
              />
            )}
            <div className="text-white">
              <p className="font-semibold">{session.user?.name}</p>
              <p className="text-sm text-blue-200">{session.user?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="ml-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 justify-center flex-wrap">
          <button
            onClick={() => setActiveTab('stocks')}
            className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all transform hover:scale-105 ${
              activeTab === 'stocks'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-2xl shadow-blue-500/50'
                : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
            }`}
          >
            <TrendingUp size={24} />
            Stock Investment
          </button>
          <button
            onClick={() => setActiveTab('retirement')}
            className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all transform hover:scale-105 ${
              activeTab === 'retirement'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-2xl shadow-purple-500/50'
                : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
            }`}
          >
            <PiggyBank size={24} />
            Retirement Planning
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-xl"
          >
            <History size={24} />
            My History ({savedCalculations.length})
          </button>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border-4 border-emerald-500">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <History className="text-emerald-600" size={32} />
              My Saved Calculations
            </h2>
            {savedCalculations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No saved calculations yet.</p>
                <p className="text-lg text-gray-500 mt-2">Save your first calculation using the button below!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {savedCalculations.map((calc: any) => (
                  <div
                    key={calc.id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:bg-blue-50 hover:border-blue-400 cursor-pointer transition-all transform hover:scale-102"
                    onClick={() => loadCalculation(calc)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-xl text-gray-900 capitalize">{calc.type} Calculation</p>
                        <p className="text-base text-gray-600 mt-1">
                          {new Date(calc.created_at).toLocaleDateString()} at{' '}
                          {new Date(calc.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(calc.results.finalBalance)}
                        </p>
                        <p className="text-sm text-gray-600 font-medium">Final Balance</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <DollarSign className="text-blue-600" size={32} />
              {activeTab === 'stocks' ? 'Investment Details' : 'Retirement Details'}
            </h2>

            {activeTab === 'stocks' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    Initial Investment ($)
                  </label>
                  <input
                    type="number"
                    value={stockInitial}
                    onChange={(e) => setStockInitial(Number(e.target.value))}
                    className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    Monthly Contribution ($)
                  </label>
                  <input
                    type="number"
                    value={stockMonthly}
                    onChange={(e) => setStockMonthly(Number(e.target.value))}
                    className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    Expected Annual Return (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={stockReturn}
                    onChange={(e) => setStockReturn(Number(e.target.value))}
                    className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    Investment Period (Years)
                  </label>
                  <input
                    type="number"
                    value={stockYears}
                    onChange={(e) => setStockYears(Number(e.target.value))}
                    className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    Current Age
                  </label>
                  <input
                    type="number"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                    className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    Current Retirement Savings ($)
                  </label>
                  <input
                    type="number"
                    value={retireInitial}
                    onChange={(e) => setRetireInitial(Number(e.target.value))}
                    className="w-full px-4 py-3 text-lgt ext-gray-900 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    Monthly Contribution ($)
                  </label>
                  <input
                    type="number"
                    value={retireMonthly}
                    onChange={(e) => setRetireMonthly(Number(e.target.value))}
                    className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    Expected Annual Return (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={retireReturn}
                    onChange={(e) => setRetireReturn(Number(e.target.value))}
                    className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    Years Until Retirement
                  </label>
                  <input
                    type="number"
                    value={retireYears}
                    onChange={(e) => setRetireYears(Number(e.target.value))}
                    className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>

                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-xl border-2 border-purple-300">
                  <p className="text-lg font-bold text-gray-900">
                    Retirement Age: <span className="text-purple-600">{currentAge + retireYears} years</span>
                  </p>
                </div>
              </div>
            )}

            {/* SAVE BUTTON */}
            <button
              onClick={saveCalculation}
              disabled={saving}
              className="w-full mt-8 px-8 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-xl flex items-center justify-center gap-3 hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-2xl shadow-green-500/50"
            >
              <Save size={28} />
              {saving ? 'Saving...' : '💾 Save to My Account'}
            </button>
          </div>

          {/* Results Panel - Same as before */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl p-6 text-white">
                <p className="text-sm font-semibold mb-2 opacity-90">Final Balance</p>
                <p className="text-4xl font-bold">{formatCurrency(finalData.balance)}</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-6 text-white">
                <p className="text-sm font-semibold mb-2 opacity-90">Total Contributions</p>
                <p className="text-4xl font-bold">{formatCurrency(finalData.contributions)}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-2xl p-6 text-white">
                <p className="text-sm font-semibold mb-2 opacity-90">Total Earnings</p>
                <p className="text-4xl font-bold">{formatCurrency(finalData.earnings)}</p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Growth Projection Over Time</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={activeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="year"
                    label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                    stroke="#374151"
                  />
                  <YAxis
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    stroke="#374151"
                  />
                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value))}
                    labelFormatter={(label) => `Year ${label}`}
                    contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    name="Total Balance"
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="contributions"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Your Contributions"
                    dot={{ fill: '#10b981', r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#a855f7"
                    strokeWidth={3}
                    name="Investment Earnings"
                    dot={{ fill: '#a855f7', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Investment Breakdown */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Investment Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b-2 border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">Your Contributions:</span>
                  <span className="font-bold text-2xl text-green-600">{formatCurrency(finalData.contributions)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b-2 border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">Investment Earnings:</span>
                  <span className="font-bold text-2xl text-purple-600">{formatCurrency(finalData.earnings)}</span>
                </div>
                <div className="flex justify-between items-center py-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl px-4 mt-4">
                  <span className="text-xl font-bold text-gray-900">Total Value:</span>
                  <span className="font-bold text-3xl text-blue-600">{formatCurrency(finalData.balance)}</span>
                </div>
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-xl mt-6 border-2 border-green-300">
                  <p className="text-base font-semibold text-gray-900">
                    <span className="text-lg">🎯 Return on Investment (ROI):</span>
                    <br />
                    Your money will grow by{' '}
                    <span className="text-purple-600 font-bold text-3xl">
                      {((finalData.earnings / finalData.contributions) * 100).toFixed(1)}%
                    </span>
                    {' '}through compound interest with monthly compounding over{' '}
                    <span className="font-bold">{activeTab === 'stocks' ? stockYears : retireYears} years</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
