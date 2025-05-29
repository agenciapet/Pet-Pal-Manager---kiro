import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, FileText, Edit, Trash2, Eye, FileSignature } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { mockContratoTemplates } from '../../data/mockData'; // Supondo que seus mocks estão aqui

export default function TemplatesContrato() {
  const navigate = useNavigate();
  const templates = mockContratoTemplates;

  const handleNovoTemplate = () => {
    navigate('/contratos/templates/novo');
  };

  const handleEditarTemplate = (id: string) => {
    navigate(`/contratos/templates/editar/${id}`);
  };

  const handleVisualizarTemplate = (id: string) => {
    // Navegar para uma tela de visualização/detalhes do template
    // navigate(`/contratos/templates/${id}`); 
    alert(`Visualizar template ${id} (funcionalidade a ser implementada)`);
  };

  const handleGerarContrato = (templateId: string, tipoTemplate: 'cliente' | 'colaborador') => {
    // Navegar para a página de seleção de entidade, passando o ID e o tipo do template
    navigate(`/contratos/gerar/selecionar-entidade?templateId=${templateId}&tipo=${tipoTemplate}`);
  };

  const handleExcluirTemplate = (id: string) => {
    // Lógica de exclusão
    alert(`Excluir template ${id} (funcionalidade a ser implementada)`);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <FileText className="mr-3 h-8 w-8 text-primary" />
          Templates de Contrato
        </h1>
        <Button onClick={handleNovoTemplate} className="shadow-md hover:shadow-lg transition-shadow">
          <PlusCircle className="mr-2 h-5 w-5" />
          Novo Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card className="mt-6 shadow-sm">
          <CardContent className="pt-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum template de contrato encontrado.</h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro template para começar a gerar contratos para clientes e colaboradores.
            </p>
            <Button onClick={handleNovoTemplate}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Primeiro Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {templates.map((template) => (
            <Card key={template.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold mb-1 leading-tight">
                    {template.nome}
                  </CardTitle>
                  <Badge 
                    variant={template.is_active ? 'default' : 'secondary'}
                    className={template.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}
                  >
                    {template.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Badge variant="outline">Versão: {template.versao}</Badge>
                  <Badge 
                    variant="outline"
                    className={template.tipo === 'cliente' ? 'border-blue-500 text-blue-600' : 'border-purple-500 text-purple-600'}
                  >
                     {template.tipo === 'cliente' ? 'Para Clientes' : 'Para Colaboradores'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                  Variáveis: {template.variaveis_disponiveis.slice(0, 5).join(', ')}{template.variaveis_disponiveis.length > 5 ? '...' : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  Criado em: {new Date(template.created_at).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-xs text-muted-foreground">
                  Atualizado em: {new Date(template.updated_at).toLocaleDateString('pt-BR')}
                </p>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between items-center">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleGerarContrato(template.id, template.tipo)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex-grow mr-2"
                  title="Gerar Contrato a partir deste Template"
                >
                  <FileSignature className="h-4 w-4 mr-2" />
                  Gerar Contrato
                </Button>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => handleVisualizarTemplate(template.id)}
                    className="hover:bg-blue-50 text-blue-600"
                    title="Visualizar Template"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEditarTemplate(template.id)}
                    className="hover:bg-yellow-50 text-yellow-600"
                    title="Editar Template"
                    >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleExcluirTemplate(template.id)}
                    className="text-destructive hover:bg-red-50 hover:text-destructive"
                    title="Excluir Template"
                    >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 