import React from 'react';
import Confirm from "util_components/bootstrap/Confirm";
import Icon from "util_components/bootstrap/Icon";
import NavBar from "util_components/bootstrap/NavBar";
import {User} from "components/types";
import Modal from "util_components/bootstrap/Modal";
import Form from "util_components/Form";

type FVHTabsUIProps = {
  activeTab: string,
  user: User,
  tabs: {
    ChildComponent: any,
    header: string,
    childProps?: any,
    icon: string,
    menuText: string,
    fullWidth?: boolean
  }[],
  onLogout: () => any,
  profileFormUrl?: string,
  onProfileUpdated?: () => any
}

type State = {
  activeTab?: string,
  showLogout: boolean,
  showProfile: boolean,
  menuOpen: boolean,
  profileMenuOpen: boolean
};

const initialState: State = {
  showLogout: false,
  showProfile: false,
  menuOpen: false,
  profileMenuOpen: false
};

export default class FVHTabsUI extends React.Component<FVHTabsUIProps, State> {
  state = initialState;

  // @ts-ignore
  onResize = () => document.getElementById('FVHTabsUI').style.height = window.innerHeight;

  componentDidMount() {
    window.addEventListener('resize', this.onResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }

  render() {
    const {user, onLogout, tabs, profileFormUrl} = this.props;
    const {activeTab, showLogout, menuOpen, profileMenuOpen, showProfile} = this.state;
    const {ChildComponent, header, childProps, fullWidth} = tabs.find(t => t.header == activeTab) || tabs[0];

    const profileIcon = user.is_courier ? "directions_bike" : "account_circle";
    return (
      <div style={{height: window.innerHeight}} className="flex-column d-flex" id="FVHTabsUI">
        <NavBar onIconClick={() => this.setState({profileMenuOpen: !profileMenuOpen, menuOpen: false})}
                icon={profileIcon}
                iconText={user.username}>

          {profileMenuOpen &&
            <div className="dropdown-menu show w-100">
              {profileFormUrl &&
                <h5 className="dropdown-item clickable pt-2 pb-2"
                    onClick={() => this.setState({showProfile: true, profileMenuOpen: false})}>
                  <Icon icon={profileIcon} className="text-primary mr-2"/> Profile
                </h5>
              }
              <h5 className="dropdown-item clickable pt-2 pb-2"
                 onClick={() => this.setState({showLogout: true, profileMenuOpen: false})}>
                <Icon icon="logout" className="text-primary mr-2"/> Log out
              </h5>
            </div>
          }

          {menuOpen &&
            <div className="dropdown-menu show w-100">
              {tabs.map(({icon, menuText, header}) => (
                <h5 key={header} className="dropdown-item clickable pt-2 pb-2"
                   onClick={() => this.switchTab(header)}>
                  <Icon icon={icon} className="text-primary mr-2"/> {menuText}
                </h5>
              ))}
            </div>
          }

          {(tabs.length < 2)
            ? <h5 className="m-2">{header}</h5>

            :
              <div className="dropdown show">
                <h5 className="mt-1 clickable"
                    onClick={() => this.setState({menuOpen: !menuOpen, profileMenuOpen: false})}>
                  <Icon icon="menu"/> {header}
                </h5>
              </div>
          }
        </NavBar>

        <div className={'flex-grow-1  flex-shrink-1 overflow-auto' + (fullWidth ? '' : " container")}>
          <ChildComponent {...childProps}/>
        </div>

        {showLogout &&
          <Confirm title="Log out?"
                   onClose={() => this.setState({showLogout: false})}
                   onConfirm={onLogout}/>
        }
        {profileFormUrl && showProfile &&
          <Modal onClose={() => this.setState({showProfile: false})}
                 headerContent={<h5><Icon icon={profileIcon} className="text-primary mr-2"/> Profile</h5>}>
            <Form schemaUrl={profileFormUrl}
                  onSave={this.onUserSaved}
                  onCancel={() => this.setState({showProfile: false})} />
          </Modal>
        }
      </div>
    );
  }

  switchTab(header: string) {
    this.setState({activeTab: header, menuOpen: false});
  }

  onUserSaved = () => {
    const {onProfileUpdated} = this.props;
    onProfileUpdated && onProfileUpdated();
    this.setState({showProfile: false});
  }
}
