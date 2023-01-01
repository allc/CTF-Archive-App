import { Box, Button } from '@mui/material';
import '../Ctfs'
import { config } from '../config';
import React from 'react';

class TopBar extends React.Component {
  constructor(props) {
    super(props);

    const token = localStorage.getItem('ctfarchive_token');
    if (token) {
      fetch(config.api_endpoint + '/auth/user',{
        headers: {
          'Authentication': 'Bearer ' + token
        }
      }).then((res) => res.json()).then(
        (json) => this.props.setUser(json)
      );
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
          <Box component="span" sx={{
            m: 1,
          }}>
            Logged in as {this.props.user.username}
          </Box>
          <Button variant="outlined" onClick={this.handleLogoutButton} sx={{
            m: 1,
          }}>Logout</Button>
        </div>
      )
    } else {
      const discord_oauth2_url = 'https://discord.com/api/oauth2/authorize?client_id=' + config.discord_client_id + '&redirect_uri=' + encodeURIComponent(config.discord_redirect_url) + '&response_type=code&scope=identify';
      return (
        <Button href={discord_oauth2_url}>Login with Discord</Button>
      );
    }
  }
}

export default TopBar;
