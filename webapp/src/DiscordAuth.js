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

  async componentDidMount() {
    const params = new URLSearchParams(window.location.search.substring(1));
    const code = params.get('code');
    const body = {
      code: code,
    };
    const res = await fetch(config.api_endpoint + '/auth/discord', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return;
    }
    res.json().then((json) => {
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
