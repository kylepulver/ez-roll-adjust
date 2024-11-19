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
            const action = ev.currentTarget.dataset.action

            // Assume there's just one roll here
            const roll = this.message.rolls[0];

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

            
            // Force update for rerolls that are a pain in the butt
            const content = $(`<div>` + this.message.content + `</div>`);
            content.find(".dice-result .dice-formula").not('.reroll-discard .dice-formula').text(roll.formula)
            content.find(".dice-result .dice-total").not('.reroll-discard .dice-total').text(roll._total)
            
            await this.message.update({
                rolls: foundry.utils.duplicate(this.message.rolls),
                content: content.html()
            })

            this.render(true);
        })
    }
}