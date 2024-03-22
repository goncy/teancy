"use client";

import {useMemo, useRef, useState} from "react";

import {Button} from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";

interface Player {
  name: string;
  score: number;
}

function getRoster() {
  const players = JSON.parse(window.localStorage.getItem("roster") || "[]") as Player[];

  const map = new Map<Player["name"], Player>();

  for (const player of players) {
    map.set(player.name, player);
  }

  return map;
}

function updateRoster(roster: Map<Player["name"], Player>) {
  window.localStorage.setItem("roster", JSON.stringify(Array.from(roster.values())));
}

export default function HomePageClient() {
  const rosterTable = useRef<HTMLTableElement>(null);
  const [draft, setDraft] = useState(() => new Set<Player["name"]>());
  const [roster, setRoster] = useState(getRoster);
  const [teamA, teamB] = useMemo(() => {
    const players = Array.from(draft).map((name) => roster.get(name) || {name, score: 0});

    let bestDiff = Infinity;
    let teams: [Player[], Player[]] = [[], []];

    for (let i = 0; i < 1 << players.length; i++) {
      const teamA: Player[] = [];
      const teamB: Player[] = [];
      let sum1 = 0;
      let sum2 = 0;

      for (let j = 0; j < players.length; j++) {
        if ((i & (1 << j)) !== 0) {
          teamA.push(players[j]);
          sum1 += players[j].score;
        } else {
          teamB.push(players[j]);
          sum2 += players[j].score;
        }
      }

      const diff = Math.abs(sum1 - sum2);

      if (diff < bestDiff) {
        bestDiff = diff;
        teams = [teamA, teamB] as const;
      }
    }

    return teams;
  }, [draft, roster]);

  async function handlePaste() {
    const clipboard = await navigator.clipboard.readText();

    const names = clipboard.split("\n").reduce<string[]>((names, line) => {
      const rawPlayer = /\d*- (.*)\n?/gi.exec(line)?.[1];

      if (!rawPlayer) return names;

      const player = rawPlayer.replace("✅", "").trim().toLowerCase();

      return names.concat(player);
    }, []);

    setDraft(new Set(names));
  }

  function handleRosterAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const rosterDraft = structuredClone(roster);

    const name = (formData.get("name") as string).trim().toLowerCase();
    const score = Number(formData.get("score"));

    rosterDraft.set(name, {name, score});

    setRoster(rosterDraft);
    updateRoster(rosterDraft);

    event.currentTarget.reset();

    queueMicrotask(() => {
      rosterTable.current?.scrollTo(0, rosterTable.current.scrollHeight);
    });
  }

  function handleDraftToggle(name: Player["name"]) {
    const newDraft = structuredClone(draft);

    if (newDraft.has(name)) {
      newDraft.delete(name);
    } else {
      newDraft.add(name);
    }

    setDraft(newDraft);
  }

  function handleRosterRemove(name: Player["name"]) {
    const newRoster = structuredClone(roster);
    const newDraft = structuredClone(draft);

    newRoster.delete(name);
    newDraft.delete(name);

    setRoster(newRoster);
    setDraft(newDraft);

    updateRoster(newRoster);
  }

  function handleCopyTeams() {
    navigator.clipboard.writeText(`Team A:
${teamA.map(({name}) => `- ${name}`).join("\n")}

Team B:
${teamB.map(({name}) => `- ${name}`).join("\n")}`);

    alert("Teams copied to clipboard");
  }

  return (
    <main className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Roster</CardTitle>
          <CardDescription>List of players on the roster</CardDescription>
        </CardHeader>
        <CardContent>
          <Table ref={rosterTable} className="h-96 overflow-y-auto border">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[32px] text-right" />
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="max-h-96 overflow-y-auto">
              {Array.from(roster.values()).map(({name, score}) => (
                <TableRow
                  key={name}
                  className={cn(draft.has(name) ? "bg-muted" : "bg-inherit", "cursor-pointer")}
                  onClick={() => handleDraftToggle(name)}
                >
                  <TableCell
                    className="cursor-pointer pr-0.5 text-right"
                    onClick={(event) => {
                      event.stopPropagation();

                      handleRosterRemove(name);
                    }}
                  >
                    ✕
                  </TableCell>
                  <TableCell className="font-medium capitalize">{name}</TableCell>
                  <TableCell className="text-right">{score} ★</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <form className="flex w-full items-center gap-4" onSubmit={handleRosterAdd}>
            <Input required className="basis-full" name="name" placeholder="Name" />
            <Input
              required
              className="basis-1/2"
              max={10}
              min={0}
              name="score"
              placeholder="Score"
              type="number"
            />
            <Button type="submit">Add to roster</Button>
          </form>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Teams</CardTitle>
          <CardDescription>Players for each team are decided based on its score</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="grid content-between gap-2">
            <Table className="border">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamA.map((player) => (
                  <TableRow
                    key={player.name}
                    className={cn(
                      player.score === 0 ? "bg-amber-500/5 hover:bg-amber-500/10" : "bg-inherit",
                      "cursor-pointer",
                    )}
                    onClick={() => handleDraftToggle(player.name)}
                  >
                    <TableCell className="font-medium capitalize">{player.name}</TableCell>
                    <TableCell className="text-right">{player.score} ★</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TableFooter>
              <TableRow className="flex justify-between">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">
                  {teamA.reduce((total, player) => total + player.score, 0)} ★
                </TableCell>
              </TableRow>
            </TableFooter>
          </div>
          <div className="grid content-between gap-2">
            <Table className="border">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamB.map((player) => (
                  <TableRow
                    key={player.name}
                    className={cn(
                      player.score === 0 ? "bg-amber-500/5 hover:bg-amber-500/10" : "bg-inherit",
                      "cursor-pointer",
                    )}
                    onClick={() => handleDraftToggle(player.name)}
                  >
                    <TableCell className="font-medium capitalize">{player.name}</TableCell>
                    <TableCell className="text-right">{player.score} ★</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TableFooter>
              <TableRow className="flex justify-between">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">
                  {teamB.reduce((total, player) => total + player.score, 0)} ★
                </TableCell>
              </TableRow>
            </TableFooter>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-4">
          <Button variant="secondary" onClick={handlePaste}>
            Paste from message
          </Button>
          <Button variant="secondary" onClick={handleCopyTeams}>
            Copy teams
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
