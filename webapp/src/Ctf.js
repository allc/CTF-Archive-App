import React from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from "@mui/material";
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
    </>
  );
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
    fetch(config.api_endpoint + '/ctf/' + this.props.slug)
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
      let more_info = marked.parse(ctf.more_info);
      more_info = DOMPurify.sanitize(more_info);
      const more_info_html = {__html: more_info};
      return (
        <>
          <h1>{ ctf.name }</h1>
          {ctf.start_date &&
            <div>Start date: {ctf.start_date}</div>
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
