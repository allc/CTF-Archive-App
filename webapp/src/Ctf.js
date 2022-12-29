import React from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Autocomplete, Button, Card, CardActions, CardContent, Chip, TextField } from "@mui/material";
import { config } from "./config";
import { useParams } from "react-router-dom";
import { marked } from "marked";
import DOMPurify from "dompurify";

function CtfPage(props) {
  const { slug } = useParams();
  return (
    <>
      <div>
        <Button href='/ctfs'><ArrowBackIcon />CTFs</Button>
      </div>
      <Ctf slug={slug} />
      <Challenges user={props.user} />
    </>
  );
}

class Challenges extends React.Component {
  render() {
    return (
      <>
        <AddChallenge user={this.props.user} />
      </>
    )
  }
}

class AddChallenge extends React.Component {
  constructor(props) {
    super(props);
    this.FAILED_TO_LOAD_MESSAGE = 'Failed to load.';
    this.state = {
      adding_challenge: false,
      categories: null,
    }
    this.handleAddChallengeButton = this.handleAddChallengeButton.bind(this)
    // this.handleAddCtfSubmit = this.handleAddCtfSubmit.bind(this)
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
        <Card component="form" onSubmit={this.handleAddCtfSubmit} sx={{
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
                (params) => <TextField {...params} label="Category" />
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
            />
            <TextField name="description" label="Description" helperText="Markdown is supported." multiline minRows={2} fullWidth sx={{
              display: 'block',
            }}/>
            <TextField name="flag" label="Flag" />
          </CardContent>
          <CardActions sx={{
            display: 'block',
          }}>
            {this.state.add_ctf_error &&
              <></>
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

  handleAddChallengeButton() {
    // fetch categories
    if (!this.state.categories || this.state.categories[0] === this.FAILED_TO_LOAD_MESSAGE) {
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
    }
    // fetch tags
    if (!this.state.tags || this.state.tags[0] === this.FAILED_TO_LOAD_MESSAGE) {
      fetch(config.api_endpoint + '/tags').then(
        (res) => res.json()
      ).then((json) => {
        const tags = json['tags'].map((category) => tags['name']);
        this.setState({
          tags: tags,
        })
      }).catch(() => {
        this.setState({
          tags: [this.FAILED_TO_LOAD_MESSAGE],
        });
      });
    }
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
    };
  }

  componentDidMount() {
    this.get_ctf();
  }

  get_ctf() {
    fetch(config.api_endpoint + '/ctfs/' + this.props.slug)
      .then((res) => res.json())
      .then((json) => {
        this.setState({
          ctf: json,
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
      let start_date = new Date(ctf.start_date);
      start_date = start_date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      return (
        <>
          <h1>{ ctf.name }</h1>
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
        </>
      );
    }
  }
}

export default CtfPage;
