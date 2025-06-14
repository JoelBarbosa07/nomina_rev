
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, TrendingUp, Users, DollarSign } from 'lucide-react';

const weeklyData = [
  { week: 'Sem 1', earnings: 18500, hours: 142 },
  { week: 'Sem 2', earnings: 22300, hours: 156 },
  { week: 'Sem 3', earnings: 19800, hours: 134 },
  { week: 'Sem 4', earnings: 25600, hours: 178 },
];

const jobTypeData = [
  { name: 'DJ', value: 45, color: '#3B82F6' },
  { name: 'Promotor', value: 25, color: '#10B981' },
  { name: 'Pinta Caritas', value: 15, color: '#F59E0B' },
  { name: 'Fotógrafo', value: 10, color: '#8B5CF6' },
  { name: 'Animador', value: 5, color: '#EF4444' },
];

const topEmployees = [
  { name: 'Carlos Rodríguez', earnings: 12500, jobs: 8 },
  { name: 'María González', earnings: 9800, jobs: 12 },
  { name: 'Juan Pérez', earnings: 8400, jobs: 6 },
  { name: 'Ana López', earnings: 7200, jobs: 9 },
  { name: 'Roberto Silva', earnings: 6800, jobs: 7 },
];

export const WeeklyReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const totalEarnings = weeklyData.reduce((sum, week) => sum + week.earnings, 0);
  const totalHours = weeklyData.reduce((sum, week) => sum + week.hours, 0);
  const averagePerHour = totalEarnings / totalHours;

  return (
    <div className="space-y-6">
      {/* Controles de período */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Reportes y Análisis
              </CardTitle>
              <CardDescription className="text-indigo-100">
                Análisis detallado del rendimiento del equipo
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32 bg-white text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                  <SelectItem value="quarter">Trimestre</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Ganancias Totales</p>
                <p className="text-2xl font-bold">${totalEarnings.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Horas Trabajadas</p>
                <p className="text-2xl font-bold">{totalHours}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Promedio/Hora</p>
                <p className="text-2xl font-bold">${averagePerHour.toFixed(0)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Empleados Activos</p>
                <p className="text-2xl font-bold">{topEmployees.length}</p>
              </div>
              <Users className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras - Ganancias semanales */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Ganancias por Semana</CardTitle>
            <CardDescription>Evolución de las ganancias semanales</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Ganancias']} />
                <Bar dataKey="earnings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico circular - Distribución por tipo de trabajo */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Distribución por Tipo de Trabajo</CardTitle>
            <CardDescription>Porcentaje de trabajos por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={jobTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {jobTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top empleados */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Top Empleados del Mes</CardTitle>
          <CardDescription>Empleados con mejor rendimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topEmployees.map((employee, index) => (
              <div key={employee.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{employee.name}</h4>
                    <p className="text-sm text-gray-500">{employee.jobs} trabajos completados</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">${employee.earnings.toLocaleString()}</div>
                  <Badge variant="secondary">Top {index + 1}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
