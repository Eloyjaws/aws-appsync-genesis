import React, { Component } from "react";
import { graphql, compose } from "react-apollo";
import { graphqlMutation } from "aws-appsync-react";
import { buildSubscription } from "aws-appsync";
import gql from "graphql-tag";
import "./styles.css";

const CreateTodo = gql`
  mutation($title: String!, $completed: Boolean!) {
    createTodo(input: { title: $title, completed: $completed }) {
      id
      title
      completed
    }
  }
`;

const ListTodos = gql`
  query {
    listTodos {
      items {
        id
        title
        completed
      }
    }
  }
`;

const SubscribeToTodos = gql`
  subscription onCreateTodo {
    onCreateTodo {
      id
      title
      completed
    }
  }
`;

class App extends Component {
  state = {
    todo: ""
  };

  componentDidMount() {
    this.props.data.subscribeToMore(
      buildSubscription(SubscribeToTodos, ListTodos)
    );
  }

  addTodo = () => {
    if (this.state.todo === "") return;
    const todo = {
      title: this.state.todo,
      completed: false
    };
    this.props.createTodo(todo);
    this.setState({ todo: "" });
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h2>Add a TODO item</h2>
          <input onChange={e => this.setState({ todo: e.target.value })} />
          <button onClick={this.addTodo}>Add Todo</button>
          {this.props.todos.map(({ title }, i) => (
            <p key={i}>
              {i} - {title}
            </p>
          ))}
        </header>
      </div>
    );
  }
}

export default compose(
  graphqlMutation(CreateTodo, ListTodos, "Todo"),
  graphql(ListTodos, {
    options: {
      fetchPolicy: "cache-and-network"
    },
    props: props => ({
      subscribeToMore: props.data.subscribeToMore,
      todos: props.data.listTodos ? props.data.listTodos.items : [],
      data: props.data
    })
  })
)(App);
