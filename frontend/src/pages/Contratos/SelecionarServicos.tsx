import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Percent, Plus, Minus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { servicesService } from '../../services/authService';

interface ServiceSelection {
  id: string;
  name: string;
  description: string;
  value: number;
  billing_frequency: string;
  quantity: number;
  discount_percentage: number;
  final_value: number;
}

export default function SelecionarServicos() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const templateId = searchParams.get('templateId');
  const entidadeId = searchParams.get('entidadeId');
  const tipo = searchParams.get('tipo');

  const [services, setServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const { services: servicesData } = await servicesService.getAllServices('active');
        setServices(servicesData);
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        alert('Erro ao carregar serviços. Verifique sua conexão.');
      }
      setLoading(false);
    };

    loadServices();
  }, []);

  const addService = (service: any) => {
    const existingService = selectedServices.find(s => s.id === service.id);
    if (existingService) {
      // Aumentar quantidade
      setSelectedServices(prev => prev.map(s => 
        s.id === service.id 
          ? { ...s, quantity: s.quantity + 1, final_value: calculateFinalValue(parseFloat(service.value), s.quantity + 1, s.discount_percentage) }
          : s
      ));
    } else {
      // Adicionar novo serviço
      const newService: ServiceSelection = {
        id: service.id,
        name: service.name,
        description: service.description,
        value: parseFloat(service.value),
        billing_frequency: service.billing_frequency,
        quantity: 1,
        discount_percentage: 0,
        final_value: parseFloat(service.value)
      };
      setSelectedServices(prev => [...prev, newService]);
    }
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const updateQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeService(serviceId);
      return;
    }
    setSelectedServices(prev => prev.map(s => 
      s.id === serviceId 
        ? { ...s, quantity, final_value: calculateFinalValue(s.value, quantity, s.discount_percentage) }
        : s
    ));
  };

  const updateDiscount = (serviceId: string, discount: number) => {
    const clampedDiscount = Math.max(0, Math.min(100, discount));
    setSelectedServices(prev => prev.map(s => 
      s.id === serviceId 
        ? { ...s, discount_percentage: clampedDiscount, final_value: calculateFinalValue(s.value, s.quantity, clampedDiscount) }
        : s
    ));
  };

  const calculateFinalValue = (value: number, quantity: number, discount: number) => {
    const subtotal = value * quantity;
    const discountAmount = subtotal * (discount / 100);
    return subtotal - discountAmount;
  };

  const getTotalValue = () => {
    return selectedServices.reduce((total, service) => total + service.final_value, 0);
  };

  const handleContinue = () => {
    if (selectedServices.length === 0) {
      alert('Selecione pelo menos um serviço para continuar.');
      return;
    }

    // Passar os serviços selecionados para a próxima etapa
    const servicesParam = encodeURIComponent(JSON.stringify(selectedServices));
    navigate(`/contratos/gerar/preencher?templateId=${templateId}&entidadeId=${entidadeId}&tipo=${tipo}&services=${servicesParam}`);
  };

  if (loading) {
    return <div className="flex-1 p-8 pt-6 text-center">Carregando serviços...</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/contratos/gerar/selecionar-entidade?templateId=${templateId}&tipo=${tipo}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">
          Selecionar Serviços
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Serviços Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Serviços Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {services.map(service => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{service.name}</h3>
                      <Badge variant="outline">{service.billing_frequency}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">
                        R$ {parseFloat(service.value).toFixed(2)}
                      </span>
                      <Button onClick={() => addService(service)} size="sm">
                        <Plus className="mr-1 h-4 w-4" />
                        Adicionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Serviços Selecionados */}
        <Card>
          <CardHeader>
            <CardTitle>Serviços Selecionados</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedServices.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum serviço selecionado
              </p>
            ) : (
              <div className="space-y-4">
                {selectedServices.map(service => (
                  <Card key={service.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold">{service.name}</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeService(service.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="text-sm font-medium">Quantidade</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateQuantity(service.id, service.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input 
                              type="number" 
                              value={service.quantity}
                              onChange={(e) => updateQuantity(service.id, parseInt(e.target.value) || 1)}
                              className="w-16 text-center"
                              min="1"
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateQuantity(service.id, service.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Desconto (%)</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Percent className="h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="number" 
                              value={service.discount_percentage}
                              onChange={(e) => updateDiscount(service.id, parseFloat(e.target.value) || 0)}
                              className="w-20"
                              min="0"
                              max="100"
                              step="0.1"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t">
                        <div className="text-sm text-muted-foreground">
                          {service.quantity}x R$ {service.value.toFixed(2)}
                          {service.discount_percentage > 0 && (
                            <span className="text-red-600"> (-{service.discount_percentage}%)</span>
                          )}
                        </div>
                        <div className="text-lg font-bold text-primary">
                          R$ {service.final_value.toFixed(2)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-primary">R$ {getTotalValue().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleContinue}
          disabled={selectedServices.length === 0}
          size="lg"
        >
          Continuar para Preenchimento
        </Button>
      </div>
    </div>
  );
}