import * as React from "react"
import Particles from "react-particles-js"
import ReactDOM from "react-dom"
import particles from "./particles"
import OperatingSystems from "./OperatingSystems"
import { Card, PanelStack } from "@blueprintjs/core"

interface State {
	showParticles: boolean
}

class Index extends React.Component<any, State> {
	constructor(props) {
		super(props)

		this.keyDown = this.keyDown.bind(this)
		this.state = {
			showParticles: true,
		}
	}

	componentDidMount() {
		addEventListener("keydown", this.keyDown)
	}

	componentWillUnmount() {
		removeEventListener("keydown", this.keyDown)
	}

	keyDown(e) {
		if (e.key === "Escape") {
			this.setState({ showParticles: !this.state.showParticles })
		}
	}

	render() {
		return (
			<React.Fragment>
				{this.state.showParticles && <Particles
					className="particles"
					width={`${innerWidth}px`}
					height={`${innerHeight}px`}
					params={particles}
				/>}

				<div className="content">
					<Card elevation={4}>
						<PanelStack initialPanel={{
							component: OperatingSystems,
							title: "Operating Systems",
						}} />
					</Card>
				</div>
			</React.Fragment>
		)
	}
}

addEventListener("DOMContentLoaded", () => {
	ReactDOM.render(<Index />, document.getElementById("root"))
})
