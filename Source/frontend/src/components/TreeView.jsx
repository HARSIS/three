import { useState } from 'react';

function NodeItem({ node, level, onAddChild, onEdit, onDelete }) {
  const [opened, setOpened] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <li className="tree-node" style={{ marginLeft: `${level * 18}px` }}>
      <div className="node-row">
        <button className="toggle" onClick={() => setOpened(!opened)}>
          {hasChildren ? (opened ? '−' : '+') : '•'}
        </button>

        <div className="node-content">
          <strong>{node.title}</strong>
          {node.content && <p>{node.content}</p>}
        </div>

        <button onClick={() => onAddChild(node)}>Добавить потомка</button>
        <button onClick={() => onEdit(node)}>Редактировать</button>
        <button className="danger" onClick={() => onDelete(node.id)}>Удалить</button>
      </div>

      {opened && hasChildren && (
        <ul>
          {node.children.map((child) => (
            <NodeItem
              key={child.id}
              node={child}
              level={level + 1}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function TreeView({ nodes, onAddChild, onEdit, onDelete }) {
  if (!nodes.length) {
    return <p className="empty">В дереве пока нет узлов.</p>;
  }

  return (
    <ul className="tree-list">
      {nodes.map((node) => (
        <NodeItem
          key={node.id}
          node={node}
          level={0}
          onAddChild={onAddChild}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}