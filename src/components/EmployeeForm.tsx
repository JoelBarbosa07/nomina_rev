
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Clock, DollarSign, Briefcase, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const EmployeeForm = () => {
  const [formData, setFormData] = useState({
    employeeName: '',
    jobType: '',
    customJobType: '',
    eventName: '',
    date: '',
    startTime: '',
    endTime: '',
    hourlyRate: '',
    description: ''
  });

  const { toast } = useToast();

  const jobTypes = [
    'DJ',
    'Promotor',
    'Pinta Caritas',
    'Fotógrafo',
    'Animador',
    'Mesero',
    'Bartender',
    'Seguridad',
    'Otro'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.employeeName || !formData.eventName || !formData.date || 
        !formData.startTime || !formData.endTime || !formData.hourlyRate) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    if (formData.jobType === 'Otro' && !formData.customJobType.trim()) {
      toast({
        title: "Especifica el tipo de trabajo",
        description: "Por favor especifica el tipo de trabajo personalizado.",
        variant: "destructive",
      });
      return;
    }

    // Calcular horas trabajadas
    const startTime = new Date(`2000-01-01T${formData.startTime}`);
    const endTime = new Date(`2000-01-01T${formData.endTime}`);
    const hoursWorked = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursWorked <= 0) {
      toast({
        title: "Horario inválido",
        description: "La hora de fin debe ser posterior a la hora de inicio.",
        variant: "destructive",
      });
      return;
    }

    const totalEarnings = hoursWorked * parseFloat(formData.hourlyRate);
    const finalJobType = formData.jobType === 'Otro' ? formData.customJobType : formData.jobType;

    console.log('Reporte enviado:', {
      ...formData,
      jobType: finalJobType,
      hoursWorked,
      totalEarnings
    });

    toast({
      title: "¡Reporte enviado exitosamente!",
      description: `Reporte para ${formData.eventName} ha sido enviado para aprobación. Total: $${totalEarnings.toLocaleString()}`,
    });

    // Limpiar formulario
    setFormData({
      employeeName: '',
      jobType: '',
      customJobType: '',
      eventName: '',
      date: '',
      startTime: '',
      endTime: '',
      hourlyRate: '',
      description: ''
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-6 h-6" />
            Crear Reporte de Trabajo
          </CardTitle>
          <CardDescription className="text-blue-100">
            Completa la información de tu trabajo realizado
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información del empleado */}
              <div className="space-y-2">
                <Label htmlFor="employeeName" className="text-sm font-medium text-gray-700">
                  Nombre del Empleado *
                </Label>
                <Input
                  id="employeeName"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={formData.employeeName}
                  onChange={(e) => handleInputChange('employeeName', e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {/* Tipo de trabajo */}
              <div className="space-y-2">
                <Label htmlFor="jobType" className="text-sm font-medium text-gray-700">
                  Tipo de Trabajo *
                </Label>
                <Select value={formData.jobType} onValueChange={(value) => handleInputChange('jobType', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona el tipo de trabajo" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          {type}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Campo personalizado para "Otro" */}
              {formData.jobType === 'Otro' && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="customJobType" className="text-sm font-medium text-gray-700">
                    Especifica el tipo de trabajo *
                  </Label>
                  <Input
                    id="customJobType"
                    type="text"
                    placeholder="Describe el tipo de trabajo específico"
                    value={formData.customJobType}
                    onChange={(e) => handleInputChange('customJobType', e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
              )}

              {/* Nombre del evento */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="eventName" className="text-sm font-medium text-gray-700">
                  Nombre del Evento *
                </Label>
                <Input
                  id="eventName"
                  type="text"
                  placeholder="Ej: Fiesta Corporativa ABC, Cumpleaños de Juan"
                  value={formData.eventName}
                  onChange={(e) => handleInputChange('eventName', e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                  <CalendarDays className="w-4 h-4 inline mr-1" />
                  Fecha del Evento *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {/* Tarifa por hora */}
              <div className="space-y-2">
                <Label htmlFor="hourlyRate" className="text-sm font-medium text-gray-700">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Tarifa por Hora *
                </Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  placeholder="150"
                  min="0"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {/* Hora de inicio */}
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-medium text-gray-700">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Hora de Inicio *
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {/* Hora de fin */}
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-sm font-medium text-gray-700">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Hora de Fin *
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {/* Descripción del trabajo */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Descripción del Trabajo (Opcional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe brevemente las actividades realizadas..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full"
                  rows={3}
                />
              </div>
            </div>

            {/* Botón de envío */}
            <div className="flex justify-end pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2">
                <Plus className="w-4 h-4 mr-2" />
                Enviar Reporte
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
