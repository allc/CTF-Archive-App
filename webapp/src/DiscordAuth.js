import React from "react";
import { config } from "./config";
import { Navigate } from "react-router-dom";

class DiscordAuth extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      logged_in: false,
    };
  }

  componentDidMount() {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const discord_token = params.get('access_token');
    const body = {
      token: discord_token,
    };
    fetch(config.api_endpoint + '/auth/discord', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then((res) => res.json())
      .then((json) => {
        localStorage.setItem('ctfarchive_token', json['token']);
        this.props.setUser({
          username: json['username'],
          access_level: json['access_level'],
        });
        this.setState({
          logged_in: true,
        });
      });
  }

  render() {
    if (this.state.logged_in) {
      return (
        <Navigate to='/ctfs' replace={true} />
      );
    }
  }
}

export default DiscordAuth;
