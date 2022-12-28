import { Button, Card, CardActions, CardContent, TextField, useTheme } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { config } from "./config";

class Ctfs extends React.Component {
  constructor(props) {
    super(props);
    document.title = 'CTFs - CTF Archive';
    this.state = {
      ctfs: [],
    };
    this.update_ctfs = this.update_ctfs.bind(this);
  }

  componentDidMount() {
    this.update_ctfs();
  }

  update_ctfs() {
    fetch(config.api_endpoint + '/ctfs').then(
      (res) => res.json()
    ).then((json) => {
      this.setState({
        ctfs: json,
      });
    });
  }

  render() {
    return (
      <>
        <h1>CTFs</h1>
        <AddCtf user={this.props.user} update_ctfs={this.update_ctfs} />
        <CtfsList ctfs={this.state.ctfs} />
      </>
    );
  }
}

class AddCtf extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      adding_ctf: false,
    }
    this.handleAddCtfButton = this.handleAddCtfButton.bind(this)
    this.handleAddCtfSubmit = this.handleAddCtfSubmit.bind(this)
  }

  render() {
    const canAddCtf = this.props.user &&
    this.props.user.access_level >= 3
    if (!this.state.adding_ctf && canAddCtf) {
      return <Button variant="contained" onClick={this.handleAddCtfButton}>Add CTF</Button>
    }
    if (this.state.adding_ctf && canAddCtf) {
      return(
        <Card component="form" onSubmit={this.handleAddCtfSubmit} sx={{
          m: 1,
          '& .MuiTextField-root': {
            m: 1,
          },
        }}>
          <CardContent>
            <TextField name="ctfname" label="CTF Name" required />
            <TextField name="link" label="Link" />
            <TextField name="ctftimeLink" label="CTFtime Link" />
            <TextField name="startDate" type="date" label="Start Date" />
            <TextField name="moreInfo" label="More Info" multiline rows={2} fullWidth sx={{
              display: 'block',
            }}/>
          </CardContent>
          <CardActions sx={{
            display: 'block',
          }}>
            {this.state.add_ctf_error &&
              <AddCtfErrorMessage error_message={this.state.add_ctf_error} />
            }
            <div style={{
              width: '100%',
              display: 'block'
            }}>
              <Button variant="contained" type="submit">Add</Button>
            </div>
          </CardActions>
        </Card>
      );
    }
  }

  handleAddCtfButton() {
    this.setState({
      adding_ctf: true,
    })
  }

  handleAddCtfSubmit(event) {
    event.preventDefault();
    const token = localStorage.getItem('ctfarchive_token');
    fetch(config.api_endpoint + '/ctfs',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authentication': 'Bearer ' + token,
      },
      body: JSON.stringify({
        name: event.target.ctfname.value,
        link: event.target.link.value,
        ctftime_link: event.target.ctftimeLink.value,
        start_date: event.target.startDate.value,
        more_info: event.target.moreInfo.value,
      })
    }).then(
      (res) => res.json()
    ).then((json) => {
      if (json.message === 'Success.') {
        this.setState({
          adding_ctf: false,
          add_ctf_error: null,
        });
        this.props.update_ctfs();
      } else {
        this.setState({
          add_ctf_error: json.message,
        })
      }
    });
  }
}

function AddCtfErrorMessage(props) {
  const theme = useTheme();
  return (
    <div style={{
      width: '100%',
      display: 'block',
      color: theme.palette.error.main,
    }}>
      {props.error_message}
    </div>
  );
}

class CtfsList extends React.Component {
  render() {
    return (
      <ul>
        {
          this.props.ctfs.map(
            (ctf) => <CtfsListItem key={ ctf.slug } ctf={ ctf } />
          )
        }
      </ul>
    );
  }
}

function CtfsListItem(props) {
  let linkTo = '/ctfs/' + props.ctf.slug;
  return (
    <li>
      <Link to={ linkTo }>{ props.ctf.name }</Link>
    </li>
  );
}

export default Ctfs;
