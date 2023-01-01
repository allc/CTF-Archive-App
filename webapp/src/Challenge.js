import ArrowBack from "@mui/icons-material/ArrowBack";
import { Button, Chip, Stack } from "@mui/material";
import DOMPurify from "dompurify";
import { marked } from "marked";
import React from "react";
import { Link, useParams } from "react-router-dom";
import { config } from "./config";

function ChallengePage(props) {
  const { ctfSlug, challengeSlug } = useParams();
  return (
    <ChallengePageComponent ctfSlug={ctfSlug} challengeSlug={challengeSlug} />
  );
}

class ChallengePageComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      challenge: null,
    }
  }

  render() {
    let ctfName = 'CTF';
    if (this.state.challenge) {
      ctfName = this.state.challenge.ctf.name;
      document.title = `${this.state.challenge.name} - ${this.state.challenge.ctf.name} - CTF Archive`;
    }
    return (
      <div>
        <div>
          <Button component={Link} to={`/ctfs/${this.props.ctfSlug}`}><ArrowBack />{ctfName}</Button>
        </div>
        <Challenge challenge={this.state.challenge} />
      </div>
    )
  }

  componentDidMount() {
    this.getChallenge();
  }

  getChallenge() {
    fetch(config.api_endpoint + `/challenges?ctf=${this.props.ctfSlug}&challenge=${this.props.challengeSlug}`).then(
      (res) => res.json()
    ).then(
      (json) => fetch(config.api_endpoint + `/challenges/${json.challenges[0].id}`).then(
        (res) => res.json()
      ).then(
        (json) => this.setState({
          challenge: json
        })
      )
    );
  }
}

function Challenge(props) {
  const challenge = props.challenge;
  if (challenge) {
    let descriptionHtml = null;
    if (challenge.description) {
      let description = marked.parse(challenge.description);
      description = DOMPurify.sanitize(description);
      descriptionHtml = {__html: description};
    }
    return (
      <div>
        <h1>{challenge.name}</h1>
        <div>Category: {challenge.category.name}</div>
        <Stack direction={'row'} spacing={1}>
          {challenge.tags.map((tag) => <Chip key={tag.slug} label={tag.name}/>)}
        </Stack>
        <div dangerouslySetInnerHTML={descriptionHtml}></div>
        <div>Flag: {challenge.flag}</div>
      </div>
    )
  }
}

export default ChallengePage;
