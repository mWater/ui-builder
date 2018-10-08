import { configure } from 'enzyme';
import ReactSixteenAdapter from 'enzyme-adapter-react-16';

// React 16 Enzyme adapter
configure({ adapter: new ReactSixteenAdapter() });