import importlib.metadata
import os

from .schema import Comparison, Coordination, Design, QA, Review

OUTPUT = {"qa": QA, "architect": Design, "reviewer": Review,
          "coordinator": Coordination, "comparison": Comparison}


class LiveAgents:
    mode = "openai"

    def __init__(self):
        if not os.environ.get("OPENAI_API_KEY"):
            raise RuntimeError("Cần OPENAI_API_KEY trong biến môi trường.")
        from agents import Agent, ModelSettings, OpenAIResponsesModel, RunConfig, Runner
        from openai import AsyncOpenAI

        self.Agent, self.ModelSettings = Agent, ModelSettings
        self.Model, self.RunConfig, self.Runner = OpenAIResponsesModel, RunConfig, Runner
        self.client = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"],
                                  base_url="https://api.openai.com/v1",
                                  max_retries=0, timeout=180.0)
        self.version = importlib.metadata.version("openai-agents")

    async def run(self, role, prompt, payload, config):
        model = self.Model(model=config.name, openai_client=self.client)
        agent = self.Agent(
            name=role, model=model, instructions=prompt, output_type=OUTPUT[role],
            model_settings=self.ModelSettings(max_tokens=config.output_tokens, store=False,
                                              truncation="disabled"),
        )
        result = await self.Runner.run(agent, payload, max_turns=1,
                                       run_config=self.RunConfig(tracing_disabled=True))
        usage = result.context_wrapper.usage
        return result.final_output, {
            "input_tokens": usage.input_tokens, "output_tokens": usage.output_tokens,
            "requests": usage.requests, "response_ids": [r.response_id for r in result.raw_responses],
        }

    async def close(self):
        await self.client.close()

