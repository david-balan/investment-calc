'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign } from 'lucide-react';

export default function Home() {
  const [initial, setInitial] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(20);

  const calculateData = () => {
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    const data = [];
    let balance = initial;
    let totalContributions = initial;

    for (let year = 0; year <= years; year++) {
      data.push({
        year,
        balance: Math.round(balance),
        contributions: Math.round(totalContributions)
      });

      for (let month = 0; month < 12 && year < years; month++) {
        balance = balance * (1 + monthlyRate) + monthly;
        totalContributions += monthly;
      }
    }
    return data;
  };

  const data = calculateData();
  const final = data[data.length - 1];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Investment Calculator
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="text-blue-600" />
              Parameters
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Initial Investment ($)</label>
                <input
                  type="number"
                  value={initial}
                  onChange={(e) => setInitial(Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Monthly Contribution ($)</label>
                <input
                  type="number"
                  value={monthly}
                  onChange={(e) => setMonthly(Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Annual Return (%)</label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Years</label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-lg font-semibold">Final Balance</p>
              <p className="text-3xl font-bold text-blue-600">
                ${final.balance.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Total Contributions: ${final.contributions.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Growth Projection</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={2} />
                <Line type="monotone" dataKey="contributions" stroke="#16a34a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
}
