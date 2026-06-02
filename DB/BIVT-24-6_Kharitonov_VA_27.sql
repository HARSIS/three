-- Курсовая работа, вариант 27: Дерево
-- Автор: Харитонов Всеволод Александрович, БИВТ-24-6
-- СУБД: PostgreSQL

DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS node_comments CASCADE;
DROP TABLE IF EXISTS tree_nodes CASCADE;
DROP TABLE IF EXISTS trees CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    age INTEGER CHECK (age IS NULL OR age >= 0),
    role_id INTEGER NOT NULL REFERENCES roles(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE trees (
    id SERIAL PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    description TEXT,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE tree_nodes (
    id SERIAL PRIMARY KEY,
    tree_id INTEGER NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES tree_nodes(id) ON DELETE CASCADE,
    title VARCHAR(180) NOT NULL,
    content TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_node_not_parent_itself CHECK (id IS NULL OR id <> parent_id)
);

CREATE TABLE node_comments (
    id SERIAL PRIMARY KEY,
    node_id INTEGER NOT NULL REFERENCES tree_nodes(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    entity_name VARCHAR(80) NOT NULL,
    entity_id INTEGER,
    action_name VARCHAR(30) NOT NULL,
    action_time TIMESTAMP NOT NULL DEFAULT NOW(),
    details TEXT
);

CREATE INDEX idx_tree_nodes_tree_id ON tree_nodes(tree_id);
CREATE INDEX idx_tree_nodes_parent_id ON tree_nodes(parent_id);
CREATE INDEX idx_trees_owner_id ON trees(owner_id);

INSERT INTO roles(name, description) VALUES
('ADMIN', 'Администратор: полный доступ к системе'),
('EDITOR', 'Редактор: создание и изменение собственных деревьев'),
('VIEWER', 'Просмотр: только чтение доступных деревьев');

-- Пароль у демо-пользователей: password
INSERT INTO users(name, email, password_hash, age, role_id) VALUES
('Администратор', 'admin@example.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Tb.KpJo1TxwlJb/d6WQ5LR0OQNyQi', 30, 1),
('Редактор', 'editor@example.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Tb.KpJo1TxwlJb/d6WQ5LR0OQNyQi', 21, 2),
('Наблюдатель', 'viewer@example.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Tb.KpJo1TxwlJb/d6WQ5LR0OQNyQi', NULL, 3);

INSERT INTO trees(title, description, owner_id, is_public) VALUES
('Дерево алгоритмов', 'Демонстрационное дерево для темы курсовой работы', 2, TRUE),
('Учебный план', 'Пример иерархической структуры дисциплин', 1, FALSE);

INSERT INTO tree_nodes(tree_id, parent_id, title, content, sort_order) VALUES
(1, NULL, 'Структуры данных', 'Корневой узел дерева знаний', 1),
(1, 1, 'Деревья', 'Иерархические структуры данных', 1),
(1, 2, 'Бинарное дерево поиска', 'У каждого узла не более двух потомков', 1),
(1, 2, 'AVL-дерево', 'Самобалансирующееся бинарное дерево поиска', 2),
(1, 2, 'Красно-черное дерево', 'Сбалансированное дерево поиска', 3),
(2, NULL, 'Курсовая работа', 'Корневой узел учебного плана', 1),
(2, 6, 'Серверная часть', 'NestJS API', 1),
(2, 6, 'Клиентская часть', 'React интерфейс', 2),
(2, 6, 'База данных', 'PostgreSQL', 3);

INSERT INTO node_comments(node_id, user_id, text) VALUES
(2, 1, 'Раздел используется для демонстрации вложенности.'),
(4, 2, 'AVL-дерево удобно для примера балансировки.');

-- Представления
CREATE OR REPLACE VIEW v_user_roles AS
SELECT u.id, u.name, u.email, u.age, r.name AS role_name
FROM users u
JOIN roles r ON r.id = u.role_id;

CREATE OR REPLACE VIEW v_tree_statistics AS
SELECT
    t.id AS tree_id,
    t.title,
    u.name AS owner_name,
    COUNT(n.id) AS node_count,
    COALESCE(MAX(levels.depth), 0) AS max_depth
FROM trees t
JOIN users u ON u.id = t.owner_id
LEFT JOIN tree_nodes n ON n.tree_id = t.id
LEFT JOIN LATERAL (
    WITH RECURSIVE up_nodes AS (
        SELECT n.id, n.parent_id, 1 AS depth
        UNION ALL
        SELECT p.id, p.parent_id, up_nodes.depth + 1
        FROM tree_nodes p
        JOIN up_nodes ON up_nodes.parent_id = p.id
    )
    SELECT MAX(depth) AS depth FROM up_nodes
) levels ON TRUE
GROUP BY t.id, t.title, u.name;

CREATE OR REPLACE VIEW v_node_paths AS
WITH RECURSIVE node_paths AS (
    SELECT id, tree_id, parent_id, title, title::TEXT AS path, 1 AS depth
    FROM tree_nodes
    WHERE parent_id IS NULL
    UNION ALL
    SELECT n.id, n.tree_id, n.parent_id, n.title, np.path || ' / ' || n.title, np.depth + 1
    FROM tree_nodes n
    JOIN node_paths np ON np.id = n.parent_id
)
SELECT * FROM node_paths;

-- Функции
CREATE OR REPLACE FUNCTION fn_count_children(p_node_id INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    result_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO result_count
    FROM tree_nodes
    WHERE parent_id = p_node_id;
    RETURN result_count;
END;
$$;

CREATE OR REPLACE FUNCTION fn_user_tree_count(p_user_id INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    result_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO result_count
    FROM trees
    WHERE owner_id = p_user_id;
    RETURN result_count;
END;
$$;

CREATE OR REPLACE FUNCTION fn_tree_depth(p_tree_id INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    result_depth INTEGER;
BEGIN
    WITH RECURSIVE tree_depth AS (
        SELECT id, parent_id, 1 AS depth
        FROM tree_nodes
        WHERE tree_id = p_tree_id AND parent_id IS NULL
        UNION ALL
        SELECT n.id, n.parent_id, td.depth + 1
        FROM tree_nodes n
        JOIN tree_depth td ON td.id = n.parent_id
    )
    SELECT COALESCE(MAX(depth), 0) INTO result_depth
    FROM tree_depth;
    RETURN result_depth;
END;
$$;

-- Хранимые процедуры
CREATE OR REPLACE PROCEDURE sp_create_tree(
    p_title VARCHAR,
    p_description TEXT,
    p_owner_id INTEGER,
    p_is_public BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO trees(title, description, owner_id, is_public)
    VALUES (p_title, p_description, p_owner_id, p_is_public);
END;
$$;

CREATE OR REPLACE PROCEDURE sp_add_node(
    p_tree_id INTEGER,
    p_parent_id INTEGER,
    p_title VARCHAR,
    p_content TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO tree_nodes(tree_id, parent_id, title, content)
    VALUES (p_tree_id, p_parent_id, p_title, p_content);
END;
$$;

CREATE OR REPLACE PROCEDURE sp_delete_tree(p_tree_id INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM trees WHERE id = p_tree_id;
END;
$$;

-- Триггерные функции и триггеры
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trg_set_updated_at();

CREATE TRIGGER trees_set_updated_at
BEFORE UPDATE ON trees
FOR EACH ROW
EXECUTE FUNCTION trg_set_updated_at();

CREATE OR REPLACE FUNCTION trg_prevent_node_cycle()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    found_id INTEGER;
BEGIN
    IF NEW.parent_id IS NULL THEN
        RETURN NEW;
    END IF;

    WITH RECURSIVE parents AS (
        SELECT id, parent_id FROM tree_nodes WHERE id = NEW.parent_id
        UNION ALL
        SELECT n.id, n.parent_id
        FROM tree_nodes n
        JOIN parents p ON p.parent_id = n.id
    )
    SELECT id INTO found_id FROM parents WHERE id = NEW.id LIMIT 1;

    IF found_id IS NOT NULL THEN
        RAISE EXCEPTION 'Цикл в дереве недопустим';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER tree_nodes_prevent_cycle
BEFORE INSERT OR UPDATE ON tree_nodes
FOR EACH ROW
EXECUTE FUNCTION trg_prevent_node_cycle();

CREATE OR REPLACE FUNCTION trg_audit_node_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO audit_log(entity_name, entity_id, action_name, details)
    VALUES ('tree_nodes', OLD.id, 'DELETE', OLD.title);
    RETURN OLD;
END;
$$;

CREATE TRIGGER tree_nodes_audit_delete
AFTER DELETE ON tree_nodes
FOR EACH ROW
EXECUTE FUNCTION trg_audit_node_delete();
