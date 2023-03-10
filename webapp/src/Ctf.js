import React from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Autocomplete, Button, Card, CardActions, CardContent, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import { config } from "./config";
import { Link, useParams } from "react-router-dom";
import { marked } from "marked";
import DOMPurify from "dompurify";
import FormErrorMessage from "./components/FormErrorMessage";
import { formatDateStringOrNull } from "./utils/formatDateString";
import { Stack } from "@mui/system";

function CtfPage(props) {
  const { slug } = useParams();
  return (
    <div>
      <div>
        <Button component={Link} to='/ctfs'><ArrowBackIcon />CTFs</Button>
      </div>
      <Ctf slug={slug} user={props.user} />
    </div>
  );
}

class AddChallenge extends React.Component {
  constructor(props) {
    super(props);
    this.FAILED_TO_LOAD_MESSAGE = 'Failed to load.';
    this.state = {
      adding_challenge: false,
      categories: null,
      tags: null,
      selected_tags: null,
      add_challenge_error: null,
    }
    this.handleAddChallengeButton = this.handleAddChallengeButton.bind(this)
    this.handleAddChallengeSubmit = this.handleAddChallengeSubmit.bind(this)
  }

  render() {
    const canAddChallenge = this.props.user &&
    this.props.user.access_level >= 3
    if (!this.state.adding_challenge && canAddChallenge) {
      return <Button variant="contained" onClick={this.handleAddChallengeButton}>Add Challenge</Button>
    }
    if (this.state.adding_challenge && canAddChallenge) {
      // show form
      const LOADING_MESSAGE = 'Loading...';
      // populate categories and tags once loaded
      let categories = [LOADING_MESSAGE];
      if (this.state.categories) {
        categories = this.state.categories;
      }
      let tags = [LOADING_MESSAGE];
      if (this.state.tags) {
        tags = this.state.tags;
      }
      // render form
      return(
        <Card component="form" onSubmit={this.handleAddChallengeSubmit} sx={{
          m: 1,
          '& .MuiTextField-root': {
            m: 1,
          },
        }}>
          <CardContent>
            <TextField name="challengename" label="Challenge Name" required />
            <Autocomplete freeSolo selectOnFocus options={categories}
              getOptionDisabled={
                (option) => option === LOADING_MESSAGE || option === this.FAILED_TO_LOAD_MESSAGE
              }
              renderInput={
                (params) => <TextField {...params} name="category" label="Category" required />
              }
            />
            <Autocomplete multiple options={tags} freeSolo
              getOptionDisabled={
                (option) => option === LOADING_MESSAGE || option === this.FAILED_TO_LOAD_MESSAGE
              }
              renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index})} />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="Tags" />
              )}
              onChange={(event, newValue) => {
                this.setState({
                  selected_tags: newValue,
                });
              }}
            />
            <TextField name="description" label="Description" helperText="Markdown is supported." multiline minRows={2} fullWidth sx={{
              display: 'block',
            }}/>
            <TextField name="flag" label="Flag" />
          </CardContent>
          <CardActions sx={{
            display: 'block',
          }}>
            {this.state.add_challenge_error &&
              <FormErrorMessage errorMessage={this.state.add_challenge_error} />
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

  handleAddChallengeSubmit(event) {
    event.preventDefault();
    const token = localStorage.getItem('ctfarchive_token');
    fetch(config.api_endpoint + '/challenges',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authentication': 'Bearer ' + token,
      },
      body: JSON.stringify({
        name: event.target.challengename.value,
        category: event.target.category.value,
        tags: this.state.selected_tags,
        description: event.target.description.value,
        flag: event.target.flag.value,
        ctf_slug: this.props.ctfSlug,
      }),
    }).then(
      (res) => res.json()
    ).then((json) => {
      if (json.message === 'Success.') {
        this.setState({
          adding_challenge: false,
          add_challenge_error: null,
        });
        this.updateChallenges();
      } else {
        this.setState({
          add_challenge_error: json.message,
        })
      }
    });
  }

  handleAddChallengeButton() {
    // fetch categories
    fetch(config.api_endpoint + '/categories').then(
      (res) => res.json()
    ).then((json) => {
      const categories = json['categories'].map((category) => category['name']);
      this.setState({
        categories: categories,
      })
    }).catch(() => {
      this.setState({
        categories: [this.FAILED_TO_LOAD_MESSAGE],
      });
    });
    // fetch tags
    fetch(config.api_endpoint + '/tags').then(
      (res) => res.json()
    ).then((json) => {
      const tags = json['tags'].map((tag) => tag['name']);
      this.setState({
        tags: tags,
      })
    }).catch(() => {
      this.setState({
        tags: [this.FAILED_TO_LOAD_MESSAGE],
      });
    });
    // change state to display form
    this.setState({
      adding_challenge: true,
    })
  }
}

class Ctf extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ctf: null,
      challenges: [],
    };
  }

  componentDidMount() {
    this.getCtf();
    this.updateChallenges();
  }

  getCtf() {
    fetch(
      config.api_endpoint + '/ctfs/' + this.props.slug
    ).then(
      (res) => res.json()
    ).then((json) => {
      this.setState({
        ctf: json,
      });
    });
  }

  updateChallenges() {
    fetch(config.api_endpoint + '/challenges/?ctf=' + this.props.slug
    ).then(
      (res) => res.json()
    ).then((json) => {
      this.setState({
        challenges: json['challenges'],
      });
    });
  }

  render() {
    let ctf = this.state.ctf;
    if (ctf) {
      document.title = this.state.ctf.name + ' - CTF Archive';
      let more_info_html = null;
      if (ctf.more_info) {
        let more_info = marked.parse(ctf.more_info);
        more_info = DOMPurify.sanitize(more_info);
        more_info_html = {__html: more_info};
      }
      const start_date = formatDateStringOrNull(ctf.start_date);
      return (
        <div>
          <h1>{ ctf.name }</h1>
          <div>
            {ctf.start_date &&
              <div>Start date: {start_date}</div>
            }
            <div>
              {ctf.link &&
                <Button href={ctf.link}>Link</Button>
              }
              {ctf.ctftime_link &&
                <Button href={ctf.ctftime_link}>On CTFtime</Button>
              }
            </div>
            <div dangerouslySetInnerHTML={more_info_html}></div>
          </div>
          <AddChallenge user={this.props.user} ctfSlug={this.props.slug} />
          <div>
            <ChallengeTable challenges={this.state.challenges} slug={this.props.slug} />
          </div>
        </div>
      );
    }
  }
}

function ChallengeTable(props) {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Challenge</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Tags</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.challenges.map((challenge) => (
            <ChallengeTableRow key={challenge.slug} challenge={challenge} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

function ChallengeTableRow(props) {
  const challengeLinkTo = '/ctfs/' + props.challenge.ctf.slug + '/' + props.challenge.slug;
  return (
    <TableRow>
      <TableCell><Link to={challengeLinkTo}>{props.challenge.name}</Link></TableCell>
      <TableCell>{props.challenge.category.name}</TableCell>
      <TableCell>
        <Stack direction="row" spacing={1}>
          {props.challenge.tags.map((tag) => (
            <Chip key={tag.slug} label={tag.name} variant="outlined" />
          ))}
        </Stack>
      </TableCell>
    </TableRow>
  )
}

export default CtfPage;
