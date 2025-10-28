import React from 'react'
import { SectionHeader } from '../ui/StatCard'
import { formatCurrency } from '../../utils/helpers'
import { RevenueChart, InvoiceStatusChart, ClientGrowthChart, ComparisonChart, SectorChart } from '../ui/Charts'
import { revenueData, invoiceStatusData, clientGrowthData, comparisonData, sectorData } from '../../data/mockData'

export const ReportsSection = ({ stats }) => (
  <div className="space-y-6">
    <SectionHeader 
      title="Rapports & Analyses" 
      subtitle="Analysez vos performances"
    />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RevenueChart data={revenueData} />
      <InvoiceStatusChart data={invoiceStatusData} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ClientGrowthChart data={clientGrowthData} />
      <ComparisonChart data={comparisonData} />
    </div>

    <SectorChart data={sectorData} />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analyse des revenus</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Ce mois</span>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">{formatCurrency(156780)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-linear-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Mois dernier</span>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">{formatCurrency(142350)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-linear-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-1000" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistiques globales</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-linear-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900 dark:to-emerald-800 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Factures payées</span>
            <span className="font-bold text-gray-900 dark:text-white text-sm">85%</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-linear-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Clients actifs</span>
            <span className="font-bold text-gray-900 dark:text-white text-sm">87%</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-linear-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Taux de conversion</span>
            <span className="font-bold text-gray-900 dark:text-white text-sm">72%</span>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Résumé mensuel</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.invoices.total}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Factures</p>
        </div>
        <div className="text-center p-4 bg-linear-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900 dark:to-emerald-800 rounded-xl">
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.clients.total}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Clients</p>
        </div>
        <div className="text-center p-4 bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-xl">
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.companies.total}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sociétés</p>
        </div>
      </div>
    </div>
  </div>
)
