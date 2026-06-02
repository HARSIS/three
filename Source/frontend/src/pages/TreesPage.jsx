import { useEffect, useState } from 'react';
import {
  createNode,
  createTree,
  deleteNode,
  getNestedTree,
  getTrees,
  updateNode,
  updateTree,
} from '../api/treesApi';
import TreeView from '../components/TreeView';

export default function TreesPage() {
  const [trees, setTrees] = useState([]);
  const [selectedTreeId, setSelectedTreeId] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [search, setSearch] = useState('');
  const [newTreeTitle, setNewTreeTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadTrees();
  }, []);

  useEffect(() => {
    if (selectedTreeId) {
      loadNodes(selectedTreeId);
    }
  }, [selectedTreeId]);

  async function loadTrees(nextSelectedId = selectedTreeId) {
    const data = await getTrees();
    setTrees(data);

    if (data.length > 0) {
      const exists = data.some((tree) => tree.id === nextSelectedId);
      setSelectedTreeId(exists ? nextSelectedId : data[0].id);
    } else {
      setSelectedTreeId(null);
      setNodes([]);
    }
  }

  async function loadNodes(treeId) {
    const data = await getNestedTree(treeId);
    setNodes(data);
  }

  async function handleCreateTree(event) {
    event.preventDefault();

    if (!newTreeTitle.trim()) {
      return;
    }

    try {
      setError('');
      const createdTree = await createTree({
        title: newTreeTitle,
        description: 'Создано через клиент',
        isPublic: true,
      });

      setNewTreeTitle('');
      await loadTrees(createdTree.id);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleEditTree() {
    const selectedTree = trees.find((tree) => tree.id === selectedTreeId);

    if (!selectedTree) {
      return;
    }

    const title = prompt('Новое название дерева', selectedTree.title);

    if (title === null || !title.trim()) {
      return;
    }

    const description = prompt(
      'Описание дерева',
      selectedTree.description || ''
    );

    if (description === null) {
      return;
    }

    try {
      setError('');
      await updateTree(selectedTree.id, {
        title,
        description,
        isPublic: selectedTree.isPublic,
      });

      await loadTrees(selectedTree.id);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleAddRoot() {
    if (!selectedTreeId) {
      return;
    }

    const title = prompt('Название корневого узла');

    if (!title) {
      return;
    }

    try {
      setError('');
      await createNode({
        treeId: selectedTreeId,
        title,
        content: 'Новый корневой узел',
      });

      await loadNodes(selectedTreeId);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleAddChild(parent) {
    const title = prompt(`Название потомка для узла "${parent.title}"`);

    if (!title) {
      return;
    }

    try {
      setError('');
      await createNode({
        treeId: selectedTreeId,
        parentId: parent.id,
        title,
        content: 'Новый дочерний узел',
      });

      await loadNodes(selectedTreeId);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleEditNode(node) {
  const title = prompt('Новое название узла', node.title);

  if (title === null || !title.trim()) {
    return;
  }

  const content = prompt('Новая серая подпись под узлом', node.content || '');

  if (content === null) {
    return;
  }

  try {
    setError('');

    await updateNode(node.id, {
      title: title.trim(),
      content: content.trim(),
      treeId: selectedTreeId,
      parentId: node.parentId || null,
      sortOrder: node.sortOrder || 0,
    });

    await loadNodes(selectedTreeId);
  } catch (e) {
    setError(e.message);
  }
}

  async function handleDeleteNode(id) {
    if (!confirm('Удалить узел вместе с дочерними элементами?')) {
      return;
    }

    try {
      setError('');
      await deleteNode(id);
      await loadNodes(selectedTreeId);
    } catch (e) {
      setError(e.message);
    }
  }

  function filterNodes(list) {
  const query = search.trim().toLowerCase();

  if (!query) {
    return list;
  }

  return list
    .map((node) => {
      const nodeMatches = node.title.toLowerCase().includes(query);

      if (nodeMatches) {
        return node;
      }

      const filteredChildren = filterNodes(node.children || []);

      if (filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        };
      }

      return null;
    })
    .filter(Boolean);
}

  return (
    <main className="page-grid">
      <aside className="panel">
        <h2>Деревья</h2>

        <form onSubmit={handleCreateTree} className="inline-form">
          <input
            placeholder="Название дерева"
            value={newTreeTitle}
            onChange={(e) => setNewTreeTitle(e.target.value)}
          />
          <button>Создать</button>
        </form>

        <div className="tree-selector">
          {trees.map((tree) => (
            <button
              key={tree.id}
              className={selectedTreeId === tree.id ? 'selected' : ''}
              onClick={() => setSelectedTreeId(tree.id)}
            >
              {tree.title}
            </button>
          ))}
        </div>
      </aside>

      <section className="panel wide">
        <div className="panel-header">
          <h2>Структура дерева</h2>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleEditTree}>Переименовать дерево</button>
            <button onClick={handleAddRoot}>Добавить корень</button>
          </div>
        </div>

        <input
          className="search"
          placeholder="Поиск узла"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {error && <div className="error">{error}</div>}

        <TreeView
          nodes={filterNodes(nodes)}
          onAddChild={handleAddChild}
          onEdit={handleEditNode}
          onDelete={handleDeleteNode}
        />
      </section>
    </main>
  );
}