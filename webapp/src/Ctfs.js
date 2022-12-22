import React from "react";
import { Link } from "react-router-dom";
import { config } from "./config";

class Ctfs extends React.Component {
  constructor(props) {
    super(props);
    document.title = 'CTFs - CTF Archive';
  }

  render() {
    return (
      <>
        <h1>CTFs</h1>
        <CtfsList />
      </>
    );
  }
}

class CtfsList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ctfs: [],
    };
  }

  componentDidMount() {
    this.get_ctfs();
  }

  get_ctfs() {
    fetch(config.api_endpoint + '/ctfs')
      .then((res) => res.json())
      .then((json) => {
        this.setState({
          ctfs: json,
        });
      });
  }

  render() {
    return (
      <ul>
        {
          this.state.ctfs.map(
            (ctf) => <CtfsListItem key={ ctf.slug } ctf={ ctf } />
          )
        }
      </ul>
    );
  }
}

function CtfsListItem(props) {
  let linkTo = '/ctf/' + props.ctf.slug;
  return (
    <li>
      <Link to={ linkTo }>{ props.ctf.name }</Link>
    </li>
  );
}

export default Ctfs;
