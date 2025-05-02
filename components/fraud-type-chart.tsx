"use client"
import { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = ['#3f51b5', '#e53935', '#43a047', '#fb8c00', '#8e24aa'];

export default function FraudTypeChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/system-stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch fraud type data');
        }
        
        const result = await response.json();
        
        // Extract fraud type data from system stats
        const fraudTypeData = result.fraud_types_distribution || [];
        
        // Format data for chart if needed
        const formattedData = Array.isArray(fraudTypeData) 
          ? fraudTypeData 
          : Object.entries(fraudTypeData).map(([name, value]) => ({
              name,
              value: Number(value)
            }));
        
        setData(formattedData);
      } catch (err) {
        console.error('Error fetching fraud type data:', err);
        setError('Failed to load fraud type data');
        
        // Set mock data if real data fails
        setData([
          { name: 'QR Tampering', value: 35 },
          { name: 'Account Takeover', value: 25 },
          { name: 'UPI Fraud', value: 20 },
          { name: 'Device Spoofing', value: 15 },
          { name: 'Other', value: 5 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800">
        <CardContent className="py-4">
          <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fraud Type Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}