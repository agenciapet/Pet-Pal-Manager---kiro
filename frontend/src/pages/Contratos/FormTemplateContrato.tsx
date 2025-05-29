import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea'; // Usaremos Textarea para o conteúdo
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import type { ContratoTemplate } from '../../data/mockData'; // Importando a interface com type-only
import { mockContratoTemplates } from '../../data/mockData';

interface FormData extends Omit<ContratoTemplate, 'id' | 'created_at' | 'updated_at'> {
  // Campos adicionais ou modificações específicas para o formulário, se necessário
}

export default function FormTemplateContrato() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    tipo: 'cliente',
    conteudo: '',
    variaveis_disponiveis: [],
    versao: '1.0',
    is_active: true,
  });

  const [novaVariavel, setNovaVariavel] = useState('');

  useEffect(() => {
    if (isEdit) {
      const template = mockContratoTemplates.find(t => t.id === id);
      if (template) {
        setFormData({
          nome: template.nome,
          tipo: template.tipo,
          conteudo: template.conteudo,
          variaveis_disponiveis: template.variaveis_disponiveis,
          versao: template.versao,
          is_active: template.is_active,
        });
      }
    }
  }, [id, isEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.variaveis_disponiveis.length === 0) {
        alert('Adicione pelo menos uma variável disponível para o template.');
        return;
    }
    // Lógica para salvar (criar ou atualizar)
    console.log('Salvando template:', formData);
    navigate('/contratos/templates');
  };

  const handleAddVariavel = () => {
    if (novaVariavel.trim() !== '' && !formData.variaveis_disponiveis.includes(novaVariavel.trim())) {
      // Adicionar chaves {} se não estiverem presentes
      const variavelFormatada = novaVariavel.startsWith('{') && novaVariavel.endsWith('}') 
                                ? novaVariavel 
                                : `{${novaVariavel}}`;
      setFormData(prev => ({
        ...prev,
        variaveis_disponiveis: [...prev.variaveis_disponiveis, variavelFormatada.trim()]
      }));
      setNovaVariavel('');
    }
  };

  const handleRemoveVariavel = (variavel: string) => {
    setFormData(prev => ({
      ...prev,
      variaveis_disponiveis: prev.variaveis_disponiveis.filter(v => v !== variavel)
    }));
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/contratos/templates')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Editar Template de Contrato' : 'Novo Template de Contrato'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Informações do Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nome" className="text-sm font-medium">Nome do Template *</label>
                <Input 
                  id="nome"
                  value={formData.nome} 
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Contrato de Prestação de Serviços PJ"
                  required 
                />
              </div>
              <div>
                <label htmlFor="tipo" className="text-sm font-medium">Tipo *</label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'cliente' | 'colaborador' })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="cliente">Para Cliente</option>
                  <option value="colaborador">Para Colaborador</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="versao" className="text-sm font-medium">Versão *</label>
                    <Input 
                    id="versao"
                    value={formData.versao} 
                    onChange={(e) => setFormData({ ...formData, versao: e.target.value })}
                    placeholder="Ex: 1.0, 1.1, 2.0-beta"
                    required 
                    />
                </div>
                <div className="flex items-end pb-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded border-gray-300 h-4 w-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">Template Ativo</span>
                    </label>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Conteúdo do Template (HTML)</CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea 
                    value={formData.conteudo}
                    onChange={(e) => setFormData({...formData, conteudo: e.target.value})}
                    placeholder="Digite ou cole o HTML do contrato aqui. Use variáveis como {NOME_CLIENTE}, {CPF_COLABORADOR}, etc."
                    className="min-h-[300px] font-mono text-sm"
                    required
                />
                <p className="text-xs text-muted-foreground mt-2">
                    Dica: Use variáveis entre chaves, como por exemplo: <code>{`{RAZAO_SOCIAL}`}</code>, <code>{`{COLABORADOR_NOME_COMPLETO}`}</code>.
                </p>
            </CardContent>
        </Card>

        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Variáveis Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-4">
                    <Input 
                        value={novaVariavel}
                        onChange={(e) => setNovaVariavel(e.target.value)}
                        placeholder="Ex: {NOME_COMPLETO} ou NOME_COMPLETO"
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); handleAddVariavel(); } }}
                    />
                    <Button type="button" onClick={handleAddVariavel} variant="outline">
                        <Plus className="mr-2 h-4 w-4" /> Adicionar
                    </Button>
                </div>
                {formData.variaveis_disponiveis.length > 0 ? (
                    <div className="space-y-2">
                        {formData.variaveis_disponiveis.map(v => (
                            <div key={v} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                <Badge variant="secondary">{v}</Badge>
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveVariavel(v)} className="h-7 w-7 text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhuma variável adicionada ainda.</p>
                )}
            </CardContent>
        </Card>

        <CardFooter className="flex justify-end gap-4 border-t pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/contratos/templates')}
          >
            Cancelar
          </Button>
          <Button type="submit" className="shadow-md hover:shadow-lg transition-shadow">
            <Save className="mr-2 h-4 w-4" />
            {isEdit ? 'Salvar Alterações' : 'Criar Template'}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
} 