from utils import notification_listener


class DummyNotify:
    def __init__(self, payload):
        self.payload = payload


class DummyConn:
    def __init__(self, notifies):
        self.notifies = notifies
        self.poll_count = 0

    def poll(self):
        self.poll_count += 1


def test_drain_notifies_reads_list_property_and_clears_queue():
    conn = DummyConn([DummyNotify("101"), DummyNotify("102")])

    drained = notification_listener._drain_notifies(conn)

    assert conn.poll_count == 1
    assert [item.payload for item in drained] == ["101", "102"]
    assert conn.notifies == []


def test_wait_for_notify_uses_blocking_select():
    called = {}

    def fake_select(read, write, exc, timeout):
        called["read"] = read
        called["timeout"] = timeout
        return ([], [], [])

    conn = DummyConn([])
    has_event = notification_listener._wait_for_notify(conn, timeout=3, select_fn=fake_select)

    assert has_event is False
    assert called["read"] == [conn]
    assert called["timeout"] == 3
