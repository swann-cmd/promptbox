import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PromptList from './prompt/PromptList';
import PromptForm from './prompt/PromptForm';
import PromptDetail from './prompt/PromptDetail';
import Button from './common/Button';

const HomePage = () => {
  const { user, signOut } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddClick = () => {
    setEditingPrompt(null);
    setShowForm(true);
  };

  const handlePromptClick = (prompt) => {
    setSelectedPrompt(prompt);
    setShowDetail(true);
  };

  const handleEditClick = (prompt) => {
    setEditingPrompt(prompt);
    setShowDetail(false);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleDetailEdit = (prompt) => {
    setShowDetail(false);
    handleEditClick(prompt);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">PromptBox</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.email}
              </span>
              <Button variant="secondary" onClick={signOut}>
                登出
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PromptList
          key={refreshKey}
          onAddClick={handleAddClick}
          onPromptClick={handlePromptClick}
          onEditClick={handleEditClick}
        />
      </main>

      <PromptForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        prompt={editingPrompt}
        onSuccess={handleFormSuccess}
      />

      <PromptDetail
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        prompt={selectedPrompt}
        onEdit={handleDetailEdit}
      />
    </div>
  );
};

export default HomePage;
