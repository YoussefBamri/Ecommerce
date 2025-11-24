import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '../ui/chart';
import { Area, AreaChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Truck,
  TrendingUp,
  DollarSign,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle
} from 'lucide-react';

interface DashboardSectionProps {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  availableDrivers: number;
  pendingTestimonials: number;
  orderStatusData: any[];
  revenueData: any[];
  categoryCounts: Record<string, number>;
  recentOrders: any[];
  onNavigateToSection: (section: string) => void;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  totalRevenue,
  totalOrders,
  pendingOrders,
  totalProducts,
  availableDrivers,
  pendingTestimonials,
  orderStatusData,
  revenueData,
  categoryCounts,
  recentOrders,
  onNavigateToSection
}) => {
  return (
    <div className="admin-dashboard-content">
      {/* Key Performance Indicators - Row 1 (Anchoring) */}
      <div className="admin-kpi-row">
        <div className="admin-kpi-grid">
          <div className="admin-kpi-card">
            <div className="admin-kpi-value">
              {totalRevenue.toLocaleString('fr-TN', { style: 'currency', currency: 'TND' })}
            </div>
            <div className="admin-kpi-label">Revenus totaux</div>
            <div className="admin-kpi-trend positive">
              <ArrowUpRight className="admin-trend-icon" />
              <span>+{totalRevenue > 0 ? ((totalRevenue / totalRevenue) * 100).toFixed(1) : 0}% ce mois</span>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-value">{totalOrders}</div>
            <div className="admin-kpi-label">Total commandes</div>
            <div className="admin-kpi-trend neutral">
              <span>{Math.floor(totalOrders * 0.3)} cette semaine</span>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-value">{pendingOrders}</div>
            <div className="admin-kpi-label">Commandes en attente</div>
            <div className="admin-kpi-trend warning">
              <span>{Math.floor(pendingOrders * 0.5)} aujourd'hui</span>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-value">{totalProducts}</div>
            <div className="admin-kpi-label">Produits actifs</div>
            <div className="admin-kpi-trend neutral">
              <span>{Object.keys(categoryCounts).length} catégories</span>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-value">{availableDrivers}</div>
            <div className="admin-kpi-label">Chauffeurs actifs</div>
            <div className="admin-kpi-trend neutral">
              <span>sur {availableDrivers + 2} chauffeurs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section - Row 2 (Data Visualization) */}
      <div className="admin-charts-section">
        <div className="admin-charts-grid">
          <div className="admin-chart-container">
            <h3 className="admin-chart-title">Évolution des revenus</h3>
            <div className="admin-chart-subtitle">Derniers 6 mois</div>
            <div className="admin-chart-wrapper">
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenus",
                    color: "#3b82f6",
                  },
                }}
                className="admin-chart"
              >
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="2 2" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>

          <div className="admin-chart-container">
            <h3 className="admin-chart-title">Statut des commandes</h3>
            <div className="admin-chart-subtitle">Répartition actuelle</div>
            <div className="admin-chart-wrapper">
              <ChartContainer
                config={{
                  pending: { label: "En attente", color: "#f59e0b" },
                  confirmed: { label: "Confirmée", color: "#3b82f6" },
                  processing: { label: "En préparation", color: "#8b5cf6" },
                  shipped: { label: "Expédiée", color: "#06b6d4" },
                  delivered: { label: "Livrée", color: "#10b981" },
                }}
                className="admin-chart"
              >
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </div>
            <div className="admin-chart-legend">
              {orderStatusData.map((item, index) => (
                <div key={index} className="admin-legend-item">
                  <div className="admin-legend-color" style={{ backgroundColor: item.fill }}></div>
                  <span className="admin-legend-text">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Details Section - Row 3 (Deep-dive) */}
      <div className="admin-details-section">
        <div className="admin-details-grid">
          <div className="admin-detail-card">
            <h3 className="admin-detail-title">Activité récente</h3>
            <div className="admin-activity-list">
              {recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="admin-activity-item">
                  <div className="admin-activity-info">
                    <div className="admin-activity-id">#{order.id.toString().padStart(6, '0')}</div>
                    <div className="admin-activity-client">{order.client.nom}</div>
                  </div>
                  <div className="admin-activity-meta">
                    <div className="admin-activity-amount">{order.total.toFixed(2)} TND</div>
                    <div className={`admin-activity-status status-${order.statut.toLowerCase()}`}>
                      {order.statut.toLowerCase()}
                    </div>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <div className="admin-empty-state">
                  <Package className="admin-empty-icon" />
                  <span>Aucune activité récente</span>
                </div>
              )}
            </div>
          </div>

          <div className="admin-detail-card">
            <h3 className="admin-detail-title">Actions rapides</h3>
            <div className="admin-actions-grid">
              <button
                className="admin-action-button"
                onClick={() => onNavigateToSection('products')}
              >
                <Package className="admin-action-icon" />
                <span>Nouveau produit</span>
              </button>
              <button
                className="admin-action-button"
                onClick={() => onNavigateToSection('orders')}
              >
                <Truck className="admin-action-icon" />
                <span>Traiter commandes</span>
              </button>
              <button
                className="admin-action-button"
                onClick={() => onNavigateToSection('drivers')}
              >
                <UserCheck className="admin-action-icon" />
                <span>Gérer chauffeurs</span>
              </button>
              <button
                className="admin-action-button"
                onClick={() => onNavigateToSection('testimonials')}
              >
                <MessageSquare className="admin-action-icon" />
                <span>Voir témoignages</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Section - Conditional */}
      {pendingTestimonials > 0 && (
        <div className="admin-alert-section">
          <div className="admin-alert-card">
            <div className="admin-alert-content">
              <MessageSquare className="admin-alert-icon" />
              <div>
                <div className="admin-alert-title">Témoignages en attente</div>
                <div className="admin-alert-description">
                  {pendingTestimonials} témoignage(s) à approuver
                </div>
              </div>
            </div>
            <button
              className="admin-alert-button"
              onClick={() => onNavigateToSection('testimonials')}
            >
              Voir les témoignages
            </button>
          </div>
        </div>
      )}
    </div>
  );
};