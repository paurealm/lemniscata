const { TV_BASE_URL, TV_USERNAME, TV_PASSWORD, TV_TIMEZONE } = process.env;

let cache = { token: null, exp: 0 };
let pending = null;

const expOf = (jwt) => {
    try {
        const p = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString());
        return (p.exp ?? 0) * 1000;
    } catch { return 0; }
};

const login = async() => {
    const res = await fetch(`${TV_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: TV_USERNAME, password: TV_PASSWORD }),
    });
    if (!res.ok) throw new Error(`Login failed: ${res.status}`);
    
    const data = await res.json();
    console.log(data)
    const token = data.access;

    if (!token) throw new Error('Invalid token: ' + JSON.stringify(Object.keys(data)));

    cache = { token, exp: expOf(token) || Date.now() + 5 * 60000 };
    return token;
}

const getToken = async() => {
    if (cache.token && Date.now() < cache.exp - 60_000) return cache.token;
    pending ??= login().finally(() => { pending = null; });
    return pending;
}

const currentProgram = async channelId => {
    const token = await getToken();
    const res = await fetch(`${TV_BASE_URL}/api/control/${channelId}/media/current`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to fetch current program: ${res.status}`);

    return await res.json();
}

const dayRange = (offsetDays = 0) => {
    const d = new Date(Date.now() + offsetDays * 86_400_000);
    const day = new Intl.DateTimeFormat('en-CA', { timeZone: TV_TIMEZONE }).format(d);
    return { start_after: `${day}T00:00:00`, start_before: `${day}T23:59:59` };
};

const fetchSchedule = async (channelId, range) => {
    const token = await getToken();
    const qs = new URLSearchParams(range).toString();
    const res = await fetch(`${TV_BASE_URL}/api/program/${channelId}?${qs}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to fetch schedule: ${res.status}`);

    return await res.json();
};

const scheduleItems = (data) => (Array.isArray(data) ? data : data.program ?? data.items ?? []);

const startOf = (item) => new Date(item.start ?? item.begin ?? item.start_time).getTime();

const dailySchedule = async channelId => fetchSchedule(channelId, dayRange(0));

const tomorrowSchedule = async channelId => fetchSchedule(channelId, dayRange(1));

const splitName = name => {
    const parts = name.split(':');
    if (parts.length < 2) return { show: name.trim(), episode: null };

    const show = parts.shift().trim();
    const episode = parts.join(':').trim();
    return { show, episode };
};

const nextProgram = async channelId => {
    const now = Date.now();
    const upcoming = (items) => items.find((item) => startOf(item) > now);

    return upcoming(scheduleItems(await dailySchedule(channelId)))
        ?? upcoming(scheduleItems(await tomorrowSchedule(channelId)))
        ?? null;
};

const setupEndpoints = app => {
    app.get('/tv/current/:channelId', async (req, res) => {
        try {
            const data = await currentProgram(req.params.channelId);

            const programName = data?.media?.title ?? data?.media?.source?.split('/').pop() ?? null;

            res.json(splitName(programName));
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: error.message });
        }
    });

    app.get('/tv/next/:channelId', async (req, res) => {
        try {
            const data = await nextProgram(req.params.channelId);

            const programName = data?.title ?? data?.source?.split('/').pop() ?? null;

            res.json({ ...splitName(programName), startTime: data?.start });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: error.message });
        }
    });

    app.get('/tv/schedule/:channelId', async (req, res) => {
        try {
            const data = await dailySchedule(req.params.channelId);

            console.log(data)

            const formattedData = data.map(item => {
                return {
                    ...splitName(item.title ?? item.source?.split('/').pop() ?? null),
                    startTime: item.start,
                    duration: item.duration,
                }
            })

            res.json(formattedData);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: error.message });
        }
    });

    app.get('/tv/schedule/:channelId/tomorrow', async (req, res) => {
        try {
            const data = await tomorrowSchedule(req.params.channelId);

            const formattedData = data.map(item => {
                return {
                    ...splitName(item.title ?? item.source?.split('/').pop() ?? null),
                    startTime: item.start,
                    duration: item.duration,
                }
            })

            res.json(formattedData);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: error.message });
        }
    });

    app.get('/tv/notes', async (req, res) => {
        try {
            // mock
            return res.json({
                notes: [
                    { 
                        message: "Pese a lo que digan por ahí, Agallas no es tan cobarde como se cuenta. Saludos desde Francia :P",
                        author: "Feldespato",
                        program: "Agallas, el perro cobarde",
                        pictureId: 2
                    },
                    {
                        message: "HOLA PROBANDO",
                        author: "Esker",
                        program: "iCarly",
                        pictureId: 0
                    },
                    {
                        message: "Han draducido tech freak como friki técnico XD",
                        author: "Launa",
                        program: "iCarly",
                        pictureId: 1
                    }
                ]
            })
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: error.message });
        }
    })
}

module.exports = {
    setupEndpoints
};