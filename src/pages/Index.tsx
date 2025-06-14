
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { EmployeeForm } from '@/components/EmployeeForm';
import { SupervisorDashboard } from '@/components/SupervisorDashboard';
import { WeeklyReports } from '@/components/WeeklyReports';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/usePostgresAuth';

const Index = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("employee");

  // Determinar qué pestañas mostrar según el rol
  const isAdmin = profile?.role === 'admin';
  const showSupervisor = isAdmin;
  const showReports = isAdmin;

  // Debug: Log profile information
  useEffect(() => {
    console.log('Profile state in Index:', profile);
    console.log('User state in Index:', user);
    console.log('Loading state in Index:', loading);
  }, [user, profile, loading]);

  // Ajustar la pestaña activa si el usuario no tiene permisos
  useEffect(() => {
    if (activeTab === 'supervisor' && !showSupervisor) {
      setActiveTab('employee');
    }
    if (activeTab === 'reports' && !showReports) {
      setActiveTab('employee');
    }
  }, [activeTab, showSupervisor, showReports]);

  // Mostrar loading mientras se carga la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirigir a auth si no está autenticado
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Datos simulados para la demo
  const weeklyStats = {
    totalReports: 24,
    pendingApproval: 8,
    totalEarnings: 12500,
    hoursWorked: 156
  };

  console.log('Tab visibility - isAdmin:', isAdmin, 'showSupervisor:', showSupervisor, 'showReports:', showReports);

  // Ajustar la pestaña activa si el usuario no tiene permisos
  useEffect(() => {
    if (activeTab === 'supervisor' && !showSupervisor) {
      setActiveTab('employee');
    }
    if (activeTab === 'reports' && !showReports) {
      setActiveTab('employee');
    }
  }, [activeTab, showSupervisor, showReports]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido, {isAdmin ? 'Administrador' : 'Empleado'}
          </h2>
          <p className="text-xl text-gray-600">
            Gestión eficiente de reportes para trabajadores de eventos
          </p>
          {/* Debug info - temporary */}
          <div className="mt-2 text-sm text-gray-500">
            Rol actual: {profile?.role || 'No definido'} | Es Admin: {isAdmin ? 'Sí' : 'No'}
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Reportes Totales
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{weeklyStats.totalReports}</div>
              <p className="text-xs text-gray-500">Esta semana</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pendientes
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{weeklyStats.pendingApproval}</div>
              <p className="text-xs text-gray-500">Por aprobar</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ganancias
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${weeklyStats.totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-gray-500">Esta semana</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Horas Trabajadas
              </CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{weeklyStats.hoursWorked}</div>
              <p className="text-xs text-gray-500">Total semanal</p>
            </CardContent>
          </Card>
        </div>

        {/* Pestañas principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${showSupervisor && showReports ? 'grid-cols-3' : showSupervisor || showReports ? 'grid-cols-2' : 'grid-cols-1'} lg:w-auto bg-white shadow-md`}>
            <TabsTrigger 
              value="employee" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Empleado
            </TabsTrigger>
            
            {showSupervisor && (
              <TabsTrigger 
                value="supervisor"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Supervisor
              </TabsTrigger>
            )}
            
            {showReports && (
              <TabsTrigger 
                value="reports"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Reportes
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="employee" className="space-y-6">
            <EmployeeForm />
          </TabsContent>

          {showSupervisor && (
            <TabsContent value="supervisor" className="space-y-6">
              <ProtectedRoute requireAdmin>
                <SupervisorDashboard />
              </ProtectedRoute>
            </TabsContent>
          )}

          {showReports && (
            <TabsContent value="reports" className="space-y-6">
              <ProtectedRoute requireAdmin>
                <WeeklyReports />
              </ProtectedRoute>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
