import { Button, Card, CardActions, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { config } from "./config";
import FormErrorMessage from "./components/FormErrorMessage";
import { formatDateString, formatDateStringOrNull } from "./utils/formatDateString";

class Ctfs extends React.Component {
  constructor(props) {
    super(props);
    document.title = 'CTFs - CTF Archive';
    this.state = {
      ctfs: [],
    };
    this.updateCtfs = this.updateCtfs.bind(this);
  }

  componentDidMount() {
    this.updateCtfs();
  }

  updateCtfs() {
    fetch(config.api_endpoint + '/ctfs').then(
      (res) => res.json()
    ).then((json) => {
      this.setState({
        ctfs: json['ctfs'],
      });
    });
  }

  render() {
    return (
      <div>
        <h1>CTFs</h1>
        <AddCtf user={this.props.user} updateCtfs={this.updateCtfs} />
        <CtfsTable ctfs={this.state.ctfs} />
      </div>
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
            <TextField type="url" name="link" label="Link" />
            <TextField type="url" name="ctftimeLink" label="CTFtime Link" />
            <TextField type="date" name="startDate" label="Start Date" InputLabelProps={{ shrink: true }} />
            <TextField name="moreInfo" label="More Info" helperText="Markdown is supported." multiline minRows={2} fullWidth sx={{
              display: 'block',
            }}/>
          </CardContent>
          <CardActions sx={{
            display: 'block',
          }}>
            {this.state.add_ctf_error &&
              <FormErrorMessage errorMessage={this.state.add_ctf_error} />
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
        this.props.updateCtfs();
      } else {
        this.setState({
          add_ctf_error: json.message,
        })
      }
    });
  }
}

class CtfsTable extends React.Component {
  render() {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>CTF</TableCell>
              <TableCell>Start date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.ctfs.map((ctf) => (
              <CtfsTableRow key={ctf.slug} ctf={ctf} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

function CtfsTableRow(props) {
  const linkTo = '/ctfs/' + props.ctf.slug;
  const startDate = formatDateStringOrNull(props.ctf.start_date);
  return (
    <TableRow>
      <TableCell><Link to={linkTo}>{props.ctf.name}</Link></TableCell>
      <TableCell>{startDate}</TableCell>
    </TableRow>
  );
}

export default Ctfs;
