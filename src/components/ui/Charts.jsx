import React from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export const RevenueChart = ({ data }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Évolution des Revenus</h3>
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="#3b82f6" 
          fillOpacity={1}
          fill="url(#colorRevenue)"
          name="Revenus (€)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
)

export const InvoiceStatusChart = ({ data }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Statut des Factures</h3>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
)

export const ClientGrowthChart = ({ data }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Croissance des Clients</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Bar dataKey="newClients" name="Nouveaux Clients" fill="#10b981" radius={[8, 8, 0, 0]} />
        <Bar dataKey="totalClients" name="Total Clients" fill="#3b82f6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
)

export const ComparisonChart = ({ data }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Comparaison Mensuelle</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="lastMonth" 
          stroke="#8b5cf6" 
          strokeWidth={3}
          name="Mois Dernier"
          dot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="thisMonth" 
          stroke="#3b82f6" 
          strokeWidth={3}
          name="Ce Mois"
          dot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
)

export const SectorChart = ({ data }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Répartition par Secteur</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis type="number" stroke="#6b7280" />
        <YAxis dataKey="sector" type="category" stroke="#6b7280" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
)
