const initialTodos = [
    {
        id: 1,
        text: "write poem",
        completed: false,
    },
    {
        id: 2,
        text: "have a meal",
        completed: true,
    },
];

// ----------------- REDUX STORE FUNCTION -----------------------------
const createStore = (reducer) => {
    let state;
    let listeners = [];

    const getState = () => {
        return state;
    };
    const dispatch = (action) => {
        state = reducer(state, action);
        listeners.forEach((listener) => listener());
    };
    const subscribe = (listener) => {
        listeners.push(listener);
        return () => {
            listeners.filter((l) => l !== listener);
        };
    };
    dispatch({});
    return {getState, dispatch, subscribe};
};

// ----------------- COMBINE REDUCERS ---------------------------------
const combineReducers = (reducers) => {
    return (state = {}, action) => {
        return Object.keys(reducers).reduce((nextState, key) => {
            nextState[key] = reducers[key](state[key], action);
            return nextState;
        }, {});
    };
};

// ----------------- REDUCERS -----------------------------------------
const changeTodo = (state, action) => {
    switch (action.type) {
        case "ADD_TODO":
            return {
                id: action.payload.id,
                text: action.payload.text,
                completed: action.payload.completed,
            };
        case "TOGGLE_TODO":
            return {...state, completed: !state.completed};
    }
};
const todos = (state = initialTodos, action) => {
    switch (action.type) {
        case "ADD_TODO":
            return [...state, changeTodo(undefined, action)];
        case "REMOVE_TODO":
            return state.filter((t) => t.id !== action.payload.id);
        case "TOGGLE_TODO":
            return state.map((todo) => {
                if (todo.id === action.payload.id) {
                    return changeTodo(todo, action);
                }
                return todo;
            });
        case "DELETE_TODO":
            return state.filter((t) => t.id !== action.payload.id);
        default:
            return state;
    }
};
const visibilityFilter = (state = "SHOW_ALL", action) => {
    switch (action.type) {
        case "SHOW_COMPLETED":
            return action.type;
        case "SHOW_ACTIVE":
            return action.type;
        case "SHOW_ALL":
            return action.type;
        default:
            return state;
    }
};
const appReducer = combineReducers({
    todos,
    visibilityFilter,
});
// --------------------------------------------------------------------


// ---------------- ACTION CREATORS ----------------------------------
const addTodoAC = (textValue) => ({
    type: "ADD_TODO",
    payload: {
        id: numGenenerator(),
        text: textValue,
        completed: false,
    }
});
const toggleTodoAC = (id) => ({type: "TOGGLE_TODO", payload: {id}});
const deleteTodoAC = (id) => ({type: "DELETE_TODO", payload: {id}});
const setFilterAC = (filter) => ({type: filter});
// --------------------------------------------------------------------

const store = createStore(appReducer);
const numGenenerator = createGenerator(store.getState().todos, 100);
const Context = React.createContext(null);


// ----------------- COMPONENTS ---------------------------------------
const Todo = ({deleteTodo, onToggleTodo, todo}) => {
    return (
        <div className="todo" key={todo.id}>
            <li
                onClick={() => onToggleTodo(todo.id)}
                className={`todo_item ${todo.completed ? "completed" : ""}`}
            >
                {todo.text}
            </li>
            <span className="delBtn" onClick={() => deleteTodo(todo.id)}>
        Del
      </span>
        </div>
    );
};
const AddTodo = ({addTodo}) => {
    const inputRef = React.useRef("");
    const onAddTodo = (value) => {
        addTodo(value);
        inputRef.current.value = "";
    };
    return (
        <>
            <input type="text" ref={inputRef} className="input_field"/>
            <button
                onClick={() => onAddTodo(inputRef.current.value)}
                className="add_btn"
            >
                Add todo
            </button>
        </>
    );
};
const TodoList = ({todos, deleteTodo, onToggleTodo}) => {
    return (
        <ul>
            {todos.map((todo) => (
                <Todo
                    key={todo.id}
                    todo={todo}
                    deleteTodo={deleteTodo}
                    onToggleTodo={onToggleTodo}
                />
            ))}
        </ul>
    );
};
const FilterButton = ({children, setFilter, filter, currentFilter}) => {
    const isActive = filter === currentFilter;
    return (
        <button
            onClick={() => setFilter(filter)}
            className={`btn ${(isActive ? "active" : "")}`}
        >
            {children}
        </button>
    );
};
const FilterContainer = ({onSetTodosFilter}) => {
    const visibilityFilter = React.useContext(Context).getState().visibilityFilter;
    return (
        <div className="filters">
            <FilterButton
                filter="SHOW_ALL"
                currentFilter={visibilityFilter}
                setFilter={onSetTodosFilter}
            >
                Show All
            </FilterButton>
            <FilterButton
                filter="SHOW_ACTIVE"
                currentFilter={visibilityFilter}
                setFilter={onSetTodosFilter}
            >
                Show Active
            </FilterButton>
            <FilterButton
                filter="SHOW_COMPLETED"
                currentFilter={visibilityFilter}
                setFilter={onSetTodosFilter}
            >
                Show Completed
            </FilterButton>
        </div>
    );
};


const App = () => {
    const store = React.useContext(Context);
    const {todos, visibilityFilter} = store.getState();
    const addTodo = (textValue) => {
        store.dispatch(addTodoAC(textValue));
    };
    const onToggleTodo = (id) => {
        store.dispatch(toggleTodoAC(id));
    };
    const onDeleteTodo = (id) => {
        store.dispatch(deleteTodoAC(id));
    };
    const onSetTodosFilter = (filter) => {
        store.dispatch(setFilterAC(filter));
    };
    const todosFilter = (todos, filter) => {
        switch (filter) {
            case "SHOW_COMPLETED":
                return todos.filter((todo) => todo.completed);
            case "SHOW_ACTIVE":
                return todos.filter((todo) => !todo.completed);
            case "SHOW_ALL":
                return todos;
        }
    };
    return (
        <div>
            <AddTodo addTodo={addTodo}/>
            <FilterContainer
                onSetTodosFilter={onSetTodosFilter}
            />
            <TodoList
                todos={todosFilter(todos, visibilityFilter)}
                deleteTodo={onDeleteTodo}
                onToggleTodo={onToggleTodo}
            />
        </div>
    );
};

// ------------------ INITIALIZATION ----------------------------------
const root = ReactDOM.createRoot(document.getElementById("app"));
const render = () => {
    root.render(
        <Context.Provider value={store}>
            <App/>
        </Context.Provider>
    );
};
store.subscribe(render);
render();


// -------------------- GENERATION UNIQ KEYS -----------------------------
function createGenerator(existingArr, range) {
    const numbers = [];
    const extractExistsIds = (list) => {
        for (let i = 0; i < list.length; i++) {
            numbers.push(list[i].id);
        }
    };
    const genNumber = () => {
        return Math.floor(Math.random() * range);
    };
    const isNumExists = (num) => {
        for (let i = 0; i < numbers.length; i++) {
            if (num === numbers[i]) return false;
        }
        return true;
    };
    extractExistsIds(existingArr);
    return () => {
        let num = genNumber();
        while (!isNumExists(num)) {
            num = genNumber();
        }
        numbers.push(num);

        return num;
    };
}
