"use strict";

import React, { Component, PropTypes } from "react";

import ActionButton from "metabase/components/ActionButton.react";
import LoadingSpinner from "metabase/components/LoadingSpinner.react";
import Modal from "metabase/components/Modal.react";

import { fetchRevisions, revertToRevision } from "../actions";

import moment from "moment";

window.moment = moment;

function formatDate(date) {
    var m = moment(date);
    if (m.isSame(moment(), 'day')) {
        return "Today, " + m.format("h:mm a");
    } else if (m.isSame(moment().subtract(1, "day"), "day")) {
        return "Yesterday, " + m.format("h:mm a");
    } else {
        return m.format("MMM D YYYY, h:mm a");
    }
}

export default class HistoryModal extends Component {
    componentDidMount() {
        let { entityType, entityId } = this.props;
        this.props.dispatch(fetchRevisions({ entity: entityType, id: entityId }));
    }

    async revert(revision) {
        let { entityType, entityId } = this.props;
        await this.props.dispatch(revertToRevision({ entity: entityType, id: entityId, revision_id: revision.id }));
        this.props.onReverted();
    }

    render() {
        var revisions = this.props.revisions[this.props.entityType+"-"+this.props.entityId];
        return (
            <Modal
                title="Change History"
                closeFn={() => this.props.onClose()}
            >
                { revisions ?
                    <div className="pb4">
                        <div className="border-bottom flex px4 py1 text-uppercase text-grey-3 text-bold h5">
                            <span className="flex-half">When</span>
                            <span className="flex-half">Who</span>
                            <span className="flex-full">What</span>
                        </div>
                        <div className="px2 scroll-y">
                            {revisions.map((revision, index) =>
                                <div key={revision.id} className="border-row-divider flex py1 px2">
                                    <span className="flex-half">{formatDate(revision.timestamp)}</span>
                                    <span className="flex-half">{revision.user.common_name}</span>
                                    <span className="flex-full flex">
                                        <span>{revision.description}</span>
                                        {index !== 0 ?
                                            <div className="flex-align-right pl1">
                                                <ActionButton
                                                    actionFn={() => this.revert(revision)}
                                                    className="Button Button--small Button--danger text-uppercase"
                                                    normalText="Revert"
                                                    activeText="Reverting…"
                                                    failedText="Revert failed"
                                                    successText="Reverted"
                                                />
                                            </div>
                                        : null}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                :
                    <LoadingSpinner />
                }
            </Modal>
        );
    }
}

HistoryModal.propTypes = {
    entityType: PropTypes.string.isRequired,
    entityId: PropTypes.number.isRequired,
    revisions: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onReverted: PropTypes.func.isRequired
};
