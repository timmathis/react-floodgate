// @flow
import { FloodgateProps, FloodgateState } from "./types";
import * as _Polyfill from "babel-polyfill";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { generator } from "functions";

class Floodgate extends Component<FloodgateProps, FloodgateState> {
	// flow types
	data: Array<any>;

	// static props
	static propTypes = {
		data: PropTypes.array.isRequired,
		initial: PropTypes.number,
		increment: PropTypes.number
	};
	static defaultProps = {
		initial: 5,
		increment: 5
	};

	// methods
	constructor({ data, increment, initial }: FloodgateProps) {
		super();
		this.queue = generator(data, increment, initial);
		this.data = data;
		this.state = {
			renderedItems: [],
			allItemsRendered: false
		};
		this.loadAll = this.loadAll.bind(this);
		this.loadNext = this.loadNext.bind(this);
		this.reset = this.reset.bind(this);
	}
	componentDidMount(): void {
		this.loadNext();
	}
	reset({ callback }: { callback: Function } = {}): void {
		this.queue = generator(this.data, this.props.increment, this.props.initial);
		this.setState(
			prevState => ({
				renderedItems: [],
				allItemsRendered: false
			}),
			() => this.loadNext({ callback })
		);
	}
	loadAll(
		{
			callback,
			suppressWarning
		}: { callback: Function, suppressWarning: boolean } = {
			suppressWarning: false
		}
	): void {
		(!this.state.allItemsRendered &&
			this.setState(prevState => {
				return {
					renderedItems: this.data,
					allItemsRendered: true
				};
			}, () => callback && callback(this.state))) ||
			(this.state.allItemsRendered &&
				!suppressWarning &&
				console.warn("Floodgate: All items are rendered"));
	}
	loadNext({ callback }: { callback: Function } = {}): void {
		!this.state.allItemsRendered &&
			this.setState(prevState => {
				const { value, done } = this.queue.next();
				const valueIsAvailable =
					value !== null && value !== undefined && value.length > 0;
				const newRenderedData = [
					...prevState.renderedItems,
					...(valueIsAvailable ? value : [])
				];
				const dataLengthMatches = newRenderedData.length === this.data.length;

				return {
					renderedItems: newRenderedData,
					allItemsRendered:
						!valueIsAvailable || (valueIsAvailable && dataLengthMatches)
							? true
							: false
				};
			}, () => callback && callback(this.state));
	}
	render(): Function {
		const { loadAll, loadNext, reset } = this;
		const { renderedItems, allItemsRendered } = this.state;
		return this.props.children({
			items: renderedItems,
			loadComplete: allItemsRendered,
			loadAll,
			loadNext,
			reset
		});
	}
}

export default Floodgate;