import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { mockServicos } from '../../data/mockData';

interface FormData {
  nome: string;
  descricao: string;
  valor: string;
  periodicidade: 'mensal' | 'trimestral' | 'semestral' | 'anual';
  ativo: boolean;
}

export default function FormServico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    descricao: '',
    valor: '',
    periodicidade: 'mensal',
    ativo: true
  });

  useEffect(() => {
    if (isEdit) {
      const servico = mockServicos.find(s => s.id === id);
      if (servico) {
        setFormData({
          nome: servico.nome,
          descricao: servico.descricao,
          valor: servico.valor.toString(),
          periodicidade: servico.periodicidade,
          ativo: servico.is_active
        });
      }
    }
  }, [id, isEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Salvando serviço:', formData);
    navigate('/servicos');
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const formattedValue = (parseInt(numericValue) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formattedValue;
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/servicos')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Editar Serviço' : 'Novo Serviço'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome do Serviço *</label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Plano Beagle"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Descrição *</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva o que está incluído neste serviço..."
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Valor *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    className="pl-10"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: formatCurrency(e.target.value) })}
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Periodicidade *</label>
                <select
                  value={formData.periodicidade}
                  onChange={(e) => setFormData({ ...formData, periodicidade: e.target.value as any })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  required
                >
                  <option value="mensal">Mensal</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="semestral">Semestral</option>
                  <option value="anual">Anual</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span>Serviço Ativo</span>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/servicos')}
          >
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            {isEdit ? 'Salvar Alterações' : 'Cadastrar Serviço'}
          </Button>
        </div>
      </form>
    </div>
  );
} 