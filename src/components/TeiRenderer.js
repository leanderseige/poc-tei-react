import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import { v4 } from 'uuid';

class TeiRenderer extends React.Component {

  constructor(props) {
      super(props)
      this.loadTEI = this.loadTEI.bind(this)
      this.editText = this.editText.bind(this)
      this.copy = this.copy.bind(this)
      this.state = {
        tei: null,
        title: null,
        notes: [],
        texti: '',
        texto: ''
      }
  }

  componentDidMount() {
    this.loadTEI()
  }

  nsResolver(prefix) {
    // console.log({prefix:prefix})
    var ns = {
      '' : 'http://www.tei-c.org/ns/1.0',
      'tei' : 'http://www.tei-c.org/ns/1.0'
    };
    return ns[prefix] || null;
  }

  copy(v) {
    navigator.clipboard.writeText(v)
  }

  getEverything(node,path) {
    // console.log({node:node})
    if(node.childElementCount<1) {
      let tp = path+'/tei:'+node.localName
      switch(node.localName) {
        case 'title':
          return(<Tooltip key={v4()} title={tp}><h2 style={{color:'purple'}} onClick={() => this.copy(tp)}>{node.textContent}</h2></Tooltip>)
        case 'date':
          return(<Tooltip key={v4()} title={tp}><p style={{color:'red'}} onClick={() => this.copy(tp)}>{node.textContent}</p></Tooltip>)
        case 'material':
          return(<Tooltip key={v4()} title={tp}><p style={{color:'green'}} onClick={() => this.copy(tp)}>{node.textContent}</p></Tooltip>)
        default:
          return(<Tooltip key={v4()} title={tp}><p style={{color:'black'}} onClick={() => this.copy(tp)}>{node.textContent}</p></Tooltip>)
      }

    } else {
      let retval = []
      for(let key in node.children) {
        retval.push(this.getEverything(node.children[key],node.localName?path+'/tei:'+node.localName:path))
      }
      return retval
    }
  }

  loadTEI() {
    fetch("tei.xml")
      .then(response => response.text())
      .then((data) => {
        let parser = new DOMParser()
        let doc = parser.parseFromString(data,"text/xml")
        // console.log({doc:doc})
        doc.createNSResolver(doc)
        // let title = doc.evaluate("//*[name()='title']", doc, null, XPathResult.STRING_TYPE, null).stringValue
        let title =
          <Tooltip title="Überschrift">
          <h1>{doc.evaluate("//tei:title", doc, this.nsResolver, XPathResult.STRING_TYPE, null).stringValue}</h1>
          </Tooltip>

        let everything = this.getEverything(doc,'')
        this.setState({
          tei: doc,
          title: title,
          everything: everything
        })
      })
  }

  editText(e) {
    this.setState({
      texti: e.target.value
    })
    try {
      let o = this.state.tei.evaluate(e.target.value, this.state.tei, this.nsResolver, XPathResult.STRING_TYPE, null).stringValue
      this.setState({
        texto: o
      })
    } catch(e) {
      this.setState({
        texto: ''
      })
    }
  }

  render() {

    // {this.state.title}

    return (
      <div>
        <Accordion>
          <AccordionSummary id="panel1a-header">XPath</AccordionSummary>
          <AccordionDetails>
              <TextField fullWidth id="texti" label="Input XPath" value={this.state.texti} onChange={this.editText}/>
              <TextField fullWidth id="texto" label="Output" value={this.state.texto} />
          </AccordionDetails>
        </Accordion>
        {this.state.everything}
      </div>
    )
  }

}


export default TeiRenderer
