export class ChatAdjustApplication extends Application {
    constructor(message) {
        super();
        this.message = message;
    }
    
    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            height: 'auto',
            id: 'roll-adjust',
            template: 'modules/ez-roll-adjust/template.hbs',
            title: "Adjust Roll",
            width: 300,
            classes: ["ez-roll-adjust"]
        };

        return foundry.utils.mergeObject(defaults, overrides);
    }

    getData(options) {
        return this.message;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.on("click", "[data-action]", async (ev) => {
            let action = ev.currentTarget.dataset.action

            let roll = this.message.rolls[0];

            let term = roll.terms.find(t => t.flavor == "adjust") ?? false;

            if (!term) {
                term = new foundry.dice.terms.NumericTerm({number: 0, options:{flavor: "adjust"}});
                roll.terms.push(new foundry.dice.terms.OperatorTerm({operator:"+"}))
                roll.terms.push(term);
            }

            if (action == "inc") {
                term.number += 1;
            }
            if (action == "dec") {
                term.number -= 1;
            }

            roll._total = roll._evaluateTotal();
            roll._formula = roll.formula;

            await this.message.update({
                rolls: foundry.utils.duplicate(this.message.rolls)
            })
            this.render(true);
        })
    }
}