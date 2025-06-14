import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, User, Calendar, DollarSign } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface Report {
  id: number;
  employeeName: string;
  jobType: string;
  eventName: string;
  date: string;
  hours: number;
  hourlyRate: number;
  status: "pending" | "approved" | "rejected";
}

export const SupervisorDashboard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const handleCreateReport = async (reportData: any) => {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) {
        throw new Error('Error al crear el reporte');
      }

      const newReport = await response.json();
      setReports(prev => [newReport.report, ...prev]);

      toast({
        title: 'Éxito',
        description: 'Reporte creado correctamente',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports');
        const contentType = response.headers.get('content-type');
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
        
        if (!contentType?.includes('application/json')) {
          throw new Error('Respuesta no es JSON válido');
        }
        
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Respuesta no es un array de reportes');
        }
        setReports(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);
  const [filter, setFilter] = useState("all");

  const filteredReports = reports.filter(report => 
    filter === "all" || report.status === filter
  );

  const handleApprove = (id: number) => {
    setReports(reports.map(report => 
      report.id === id ? { ...report, status: "approved" } : report
    ));
  };

  const handleReject = (id: number) => {
    setReports(reports.map(report => 
      report.id === id ? { ...report, status: "rejected" } : report
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const pendingCount = reports.filter(r => r.status === "pending").length;
  const approvedCount = reports.filter(r => r.status === "approved").length;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6" />
            Dashboard del Supervisor
          </CardTitle>
          <CardDescription className="text-green-100">
            Gestiona y aprueba los reportes de trabajo de tu equipo
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Estadísticas del supervisor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Pendientes</p>
                <p className="text-3xl font-bold">{pendingCount}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Aprobados</p>
                <p className="text-3xl font-bold">{approvedCount}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Reportes</p>
                <p className="text-3xl font-bold">{reports.length}</p>
              </div>
              <User className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-2 mb-4">
            <Button 
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              Todos
            </Button>
            <Button 
              variant={filter === "pending" ? "default" : "outline"}
              onClick={() => setFilter("pending")}
            >
              Pendientes
            </Button>
            <Button 
              variant={filter === "approved" ? "default" : "outline"}
              onClick={() => setFilter("approved")}
            >
              Aprobados
            </Button>
            <Button 
              variant={filter === "rejected" ? "default" : "outline"}
              onClick={() => setFilter("rejected")}
            >
              Rechazados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de reportes */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback className="bg-blue-600 text-white">
                      {report.employeeName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{report.employeeName}</h3>
                    <p className="text-sm text-gray-600">{report.eventName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Tipo</p>
                    <Badge variant="secondary">{report.jobType}</Badge>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="text-sm font-medium">{report.date}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Horas</p>
                    <p className="text-sm font-medium">{report.hours}h</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-lg font-bold text-green-600">
                      ${(report.hours * report.hourlyRate).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-center">
                    <Badge className={getStatusColor(report.status)}>
                      {report.status === "pending" ? "Pendiente" : 
                       report.status === "approved" ? "Aprobado" : "Rechazado"}
                    </Badge>
                  </div>

                  {report.status === "pending" && (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleApprove(report.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleReject(report.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
