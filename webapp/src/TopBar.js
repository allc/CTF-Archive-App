import { Button } from '@mui/material';
import './Ctfs'
import { config } from './config';
import React from 'react';

class TopBar extends React.Component {
  constructor(props) {
    super(props);

    if (localStorage.getItem('ctfarchive_token')) {
      
    }

    this.handleLogoutButton = this.handleLogoutButton.bind(this);
  }

  handleLogoutButton() {
    localStorage.removeItem('ctfarchive_token');
    this.props.setUser(null);
  }

  render() {
    if (this.props.user) {
      return (
        <div>
          Logged in as {this.props.user.username}
          <Button variant="outlined" onClick={this.handleLogoutButton}>Logout</Button>
        </div>
      )
    } else {
      const discord_oauth2_url = 'https://discord.com/api/oauth2/authorize?client_id=' + config.discord_client_id + '&redirect_uri=' + encodeURIComponent(config.discord_redirect_url) + '&response_type=token&scope=identify';
      return (
        <Button href={discord_oauth2_url}>Login with Discord</Button>
      );
    }
  }
}

export default TopBar;
