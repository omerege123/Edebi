async function test() {
    const quoteId = "1";
    const userId = "1";

    console.log('--- Testing LIKE ---');
    try {
        const res = await fetch(`http://localhost:3000/api/quotes/${quoteId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId })
        });
        const data = await res.json();
        console.log('Like Response:', data);
    } catch (err) {
        console.error('Like Err:', err);
    }

    console.log('--- Testing COMMENT ---');
    try {
        const res = await fetch(`http://localhost:3000/api/quotes/${quoteId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, content: 'Test comment' })
        });
        const data = await res.json();
        console.log('Comment Response:', data);
    } catch (err) {
        console.error('Comment Err:', err);
    }
}

test();
